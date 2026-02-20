"use client";

import { useState, useMemo } from "react";
import { Category } from "@/types/category";

interface CategoryListProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateNew: () => void;
  filterText: string;
}

export default function CategoryList({
  categories,
  selectedId,
  onSelect,
  onCreateNew,
  filterText
}: CategoryListProps) {
  
  // Flatten for search or keep tree? 
  // Requirement: "Debounce (500ms) before filter tree."
  // For simplicity here, I will do client-side filtering.
  // If search text exists, we might want to flatten or filter the tree.
  // Let's implement basic tree rendering first.

  return (
    <div className="flex w-[350px] md:w-[450px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shrink-0 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Tất Cả Danh Mục
        </h3>
        <button 
            onClick={onCreateNew}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary text-white hover:bg-primary/90 text-xs font-medium transition-colors"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            add
          </span>
          Thêm Mới
        </button>
      </div>

      {/* Header Row */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 grid grid-cols-[1fr_60px_60px_32px] gap-2 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div>Tên</div>
        <div className="text-right">Số Lượng</div>
        <div className="text-center">Trạng Thái</div>
        <div></div>
      </div>

      {/* Scrollable Tree */}
      <div className="flex-1 overflow-y-auto">
         <CategoryTree 
            nodes={categories} 
            selectedId={selectedId} 
            onSelect={onSelect} 
            search={filterText}
         />
      </div>
    </div>
  );
}

// Recursive Tree Component
function CategoryTree({ nodes, selectedId, onSelect, search }: { 
    nodes: Category[], 
    selectedId: number | null, 
    onSelect: (id: number) => void,
    search: string
}) {
    if (!nodes || nodes.length === 0) return null;

    // Filter logic if search exist (Simple implementation: Show all if match, else hide)
    // Improve: If searching, expand all parent nodes of matched items.
    
    return (
        <div className="flex flex-col">
            {nodes.map(node => (
                <CategoryTreeItem 
                    key={node.id} 
                    node={node} 
                    selectedId={selectedId} 
                    onSelect={onSelect}
                    search={search}
                />
            ))}
        </div>
    );
}

function CategoryTreeItem({ node, selectedId, onSelect, search }: { 
    node: Category, 
    selectedId: number | null, 
    onSelect: (id: number) => void,
    search: string
}) {
    const [expanded, setExpanded] = useState(true);
    
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    
    // Check if matches search
    const matchesSearch = node.title.toLowerCase().includes(search.toLowerCase());
    
    // If we have children, we need to check if ANY child matches to decide if we show this node (when searching)
    // This recursive check logic can be expensive on render, strictly speaking better done at the top list level.
    // For now, let's just render.

    return (
        <>
            <div 
                onClick={() => onSelect(node.id)}
                className={`
                    group grid grid-cols-[1fr_60px_60px_32px] gap-2 items-center px-4 py-2.5 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors
                    ${isSelected 
                        ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary pl-[calc(1rem-4px)]' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-l-transparent'
                    }
                `}
            >
                {/* Name & Expand */}
                <div className="flex items-center gap-2 overflow-hidden" style={{ paddingLeft: `${node.level * 16}px` }}> {/* Indent */}
                    {hasChildren ? (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                                {expanded ? 'expand_more' : 'chevron_right'}
                            </span>
                        </button>
                    ) : (
                        <span className="w-[18px]"></span> // Spacer for alignment
                    )}
                    
                    <span className={`truncate text-sm ${isSelected ? 'font-semibold text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                        {node.title}
                    </span>
                </div>

                {/* Items Count */}
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    {node.productCount}
                </div>

                {/* Status */}
                <div className="text-center">
                    <span className={`
                        inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold
                        ${node.isActive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }
                    `}>
                        {node.isActive ? 'HOẠT ĐỘNG' : 'ẨN'}
                    </span>
                </div>
                
                {/* Edit Icon */}
                <div className="text-center">
                     <span
                      className={`material-symbols-outlined text-slate-400 transition-opacity ${isSelected ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100'}`}
                      style={{ fontSize: "16px" }}
                    >
                      edit
                    </span>
                </div>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <CategoryTree 
                    nodes={node.children!} 
                    selectedId={selectedId} 
                    onSelect={onSelect}
                    search={search}
                />
            )}
        </>
    );
}
