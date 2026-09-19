package com.store.e_commerce.service.impl;

import com.store.e_commerce.config.ConfigVnPay;
import com.store.e_commerce.dto.response.ResponseVnPayIpn;
import com.store.e_commerce.entity.Order;
import com.store.e_commerce.repository.OrderRepository;
import com.store.e_commerce.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final ConfigVnPay configVnPay;
    private final OrderRepository orderRepository;

    @Override
    public String createPaymentUrl(Order order, HttpServletRequest req) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String orderType = "other";

            long amount = order.getFinalAmount()
                    .multiply(new BigDecimal("100"))
                    .longValue();

            String vnp_TxnRef = order.getOrderCode();
            String vnp_IpAddr = configVnPay.getIpAddress(req);
            String vnp_TmnCode = configVnPay.vnp_TmnCode;
            String vnp_OrderInfo = "Thanh toan don hang:" + order.getOrderCode();

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            
            // Nếu có bank code thì thêm vào, ở đây mặc định cho user chọn trên cổng VNPAY
            // vnp_Params.put("vnp_BankCode", "NCB"); 

            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", orderType);

            String locate = req.getParameter("language");
            if (locate != null && !locate.isEmpty()) {
                vnp_Params.put("vnp_Locale", locate);
            } else {
                vnp_Params.put("vnp_Locale", "vn");
            }


            vnp_Params.put("vnp_ReturnUrl", configVnPay.vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Log parameters for debugging
            log.info("VNPAY Params: {}", vnp_Params);

            // Build hashData (NO encode) and query (WITH encode)
            // Note: configVnPay.getPaymentURL sorts parameters automatically
            String hashData = configVnPay.getPaymentURL(vnp_Params, false);
            String query = configVnPay.getPaymentURL(vnp_Params, true);

            String vnp_SecureHash = configVnPay.hmacSHA512(configVnPay.secretKey, hashData);
            query += "&vnp_SecureHash=" + vnp_SecureHash;

            String paymentUrl = configVnPay.vnp_PayUrl + "?" + query;
            return paymentUrl;

        } catch (Exception e) {
            log.error("Error creating VNPAY URL", e);
            throw new RuntimeException("Error creating payment URL", e);
        }
    }

    @Override
    public ResponseVnPayIpn processIpn(Map<String, String> ipnParams) {
        try {
            // 1. Check checksum
            String secureHash = ipnParams.get("vnp_SecureHash");
            
            // Create a copy to remove hash params for verification
            Map<String, String> verifyParams = new HashMap<>(ipnParams);
            verifyParams.remove("vnp_SecureHash");
            verifyParams.remove("vnp_SecureHashType");
            
            String hashData = configVnPay.getPaymentURL(verifyParams, false);
            String signedHash = configVnPay.hmacSHA512(configVnPay.secretKey, hashData);

            if (!signedHash.equals(secureHash)) {
                return new ResponseVnPayIpn("97", "Invalid Checksum");
            }

            // 2. Find Order
            String orderCode = ipnParams.get("vnp_TxnRef");
            
            // Assume orderCode is stored in orderCode field in DB
            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (orderOpt.isEmpty()) {
                 return new ResponseVnPayIpn("01", "Order not Found");
            }
            Order order = orderOpt.get();

            // 3. Check Amount
            long amountFromVnpay = Long.parseLong(ipnParams.get("vnp_Amount"));
            long amountFromDb = order.getFinalAmount().multiply(new BigDecimal(100)).longValue();
            if (amountFromVnpay != amountFromDb) {
                 return new ResponseVnPayIpn("04", "Invalid Amount");
            }

            // 4. Check Status (Don't update if already finalized)
            // PaymentStatus: 0=Unpaid, 1=Paid
            if (order.getPaymentStatus() == 1) {
                 return new ResponseVnPayIpn("02", "Order already confirmed");
            }

            // 5. Update Status
            String responseCode = ipnParams.get("vnp_ResponseCode");
            String transactionStatus = ipnParams.get("vnp_TransactionStatus");

            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                order.setPaymentStatus(1); // PAID
                order.setVnPayTxnRef(orderCode);
                order.setTransactionId(ipnParams.get("vnp_TransactionNo"));
                
                 try {
                    DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                    LocalDateTime payDate = LocalDateTime.parse(ipnParams.get("vnp_PayDate"), dtFormatter);
                    order.setPaidAt(payDate);
                } catch (Exception e) {
                    order.setPaidAt(LocalDateTime.now());
                }
                
                // You might want to update order general status too if needed
                // order.setStatus(1); // Confirmed
            } else {
                // Payment Failed
                // order.setPaymentStatus(0); // Still Unpaid or create a FAILED status
                // Status 4 = Cancelled?
                // order.setStatus(4); 
            }

            orderRepository.save(order);
            return new ResponseVnPayIpn("00", "Confirm Success");

        } catch (Exception e) {
            log.error("Error processing IPN", e);
            return new ResponseVnPayIpn("99", "Unknown error");
        }
    }
}
