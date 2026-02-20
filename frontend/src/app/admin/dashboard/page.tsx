import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import SalesChart from "@/components/admin/dashboard/SalesChart";
import TopProductsList from "@/components/admin/dashboard/TopProductsList";
import TrafficSourceChart from "@/components/admin/dashboard/TrafficSourceChart";

export default function AdminDashboard() {
  return (
    <div>
      

      {/* KPI Cards */}
      <DashboardStats />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SalesChart />
        <TopProductsList />
      </div>

      {/* Bottom Section: Recent Orders & Top Selling */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <RecentOrdersTable />
        
      </div>
    </div>
  );
}
