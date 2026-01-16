import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { UseCase, GraphNode, GraphLink } from '../types';
import { MITRE_TACTICS_LIST } from '../constants';

// Internal type for prop passing
type SelectionState = 
  | { type: 'usecase'; data: UseCase }
  | { type: 'tactic'; id: string }
  | null;

interface MitreVizProps {
  data: UseCase[];
  currentSelection: SelectionState;
  categoryColors: Record<string, string>;
  isCapturing?: boolean; // Prop to indicate presentation mode
  onSelectUseCase: (useCase: UseCase | null) => void;
  onSelectTactic: (tacticId: string | null) => void;
}

const MitreViz: React.FC<MitreVizProps> = ({ data, currentSelection, categoryColors, isCapturing = false, onSelectUseCase, onSelectTactic }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null); 
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const [leftPanelWidth, setLeftPanelWidth] = useState(65); 
  const [rightPanelWidth, setRightPanelWidth] = useState(16); 
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  const [customTitle, setCustomTitle] = useState("Coverage Map");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [fontLevel, setFontLevel] = useState(0);

  const nodesRef = useRef<GraphNode[]>([]);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const getFontClasses = () => {
    switch (fontLevel) {
        case 1: 
            return { list: 'text-xs', sub: 'text-[10px]', header: 'text-xs' };
        case 2: 
            return { list: 'text-base leading-tight', sub: 'text-sm font-bold', header: 'text-sm font-bold tracking-widest' };
        default: 
            return { list: 'text-[11px]', sub: 'text-[8px]', header: 'text-[10px]' };
    }
  };
  const fontClasses = getFontClasses();

  const tacticStats = useMemo(() => {
    const stats: Record<string, number> = {};
    MITRE_TACTICS_LIST.forEach(t => stats[t] = 0);
    
    data.forEach(uc => {
        const hasAll = uc.tactics.some(t => t.toLowerCase() === 'all');
        if (hasAll) {
            MITRE_TACTICS_LIST.forEach(t => stats[t]++);
        } else {
            uc.tactics.forEach(t => {
                if (stats[t] !== undefined) stats[t]++;
            });
        }
    });
    return stats;
  }, [data]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!wrapperRef.current) return;
        const bounds = wrapperRef.current.getBoundingClientRect();
        const totalWidth = bounds.width;

        if (isDraggingLeft.current) {
            const relativeX = e.clientX - bounds.left;
            let newWidthInfo = (relativeX / totalWidth) * 100;
            if (newWidthInfo < 15) newWidthInfo = 15;
            if (newWidthInfo > 85) newWidthInfo = 85;
            setLeftPanelWidth(newWidthInfo);
        }

        if (isDraggingRight.current) {
             const relativeX = e.clientX - bounds.left;
             const widthFromRight = totalWidth - relativeX;
             let newWidthInfo = (widthFromRight / totalWidth) * 100;
             if (newWidthInfo < 10) newWidthInfo = 10;
             if (newWidthInfo > 40) newWidthInfo = 40;
             setRightPanelWidth(newWidthInfo);
        }
    };

    const handleMouseUp = () => {
        isDraggingLeft.current = false;
        isDraggingRight.current = false;
        document.body.style.cursor = 'default';
    };

    if (isCapturing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isCapturing]);


  useEffect(() => {
    if (!graphContainerRef.current) return;
    
    const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            setDimensions(prev => {
                if (Math.abs(prev.width - width) > 10 || Math.abs(prev.height - height) > 10) {
                    return { width, height };
                }
                return prev;
            });
        }
    });

    observer.observe(graphContainerRef.current);
    return () => observer.disconnect();
  }, [isCapturing, leftPanelWidth, rightPanelWidth]);

  const handleFitToScreen = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || nodesRef.current.length === 0) return;
    const svg = d3.select(svgRef.current);
    
    const padding = 50;
    const minX = d3.min(nodesRef.current, d => d.x!)! - padding;
    const maxX = d3.max(nodesRef.current, d => d.x!)! + padding;
    const minY = d3.min(nodesRef.current, d => d.y!)! - padding;
    const maxY = d3.max(nodesRef.current, d => d.y!)! + padding;

    const width = maxX - minX;
    const height = maxY - minY;

    if (width > 0 && height > 0) {
        const scale = Math.min(2, 0.9 / Math.max(width / dimensions.width, height / dimensions.height));
        const tx = dimensions.width / 2 - scale * (minX + width / 2);
        const ty = dimensions.height / 2 - scale * (minY + height / 2);

        svg.transition().duration(750).call(
            zoomBehaviorRef.current.transform,
            d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
    }
  };

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    const width = dimensions.width;
    const height = dimensions.height;

    const activeTactics = new Set<string>();
    data.forEach(uc => {
        const hasAll = uc.tactics.some(t => t.toLowerCase() === 'all');
        if (hasAll) {
            MITRE_TACTICS_LIST.forEach(t => activeTactics.add(t));
        } else {
            uc.tactics.forEach(t => activeTactics.add(t));
        }
    });

    const uniqueTactics: string[] = Array.from(activeTactics);
    
    const tacticNodes: GraphNode[] = uniqueTactics.map(t => ({
      id: t,
      group: t,
      radius: 40, 
      type: 'tactic',
      data: { id: t, description: `${t} Tactic`, tactics: [t], techniques: [] } as UseCase,
      x: width / 2,
      y: height / 2
    }));

    const useCaseNodes: GraphNode[] = data.map(uc => {
      const primaryTactic = uc.tactics[0] || 'Unknown';
      return {
        id: uc.id,
        group: primaryTactic,
        radius: 20 + (uc.techniques.length * 2), 
        type: 'usecase',
        data: uc,
        x: width / 2 + (Math.random() - 0.5) * 50,
        y: height / 2 + (Math.random() - 0.5) * 50
      };
    });

    const nodes: GraphNode[] = [...tacticNodes, ...useCaseNodes];
    nodesRef.current = nodes; 

    const links: GraphLink[] = [];
    useCaseNodes.forEach(uc => {
      const hasAll = uc.data.tactics.some(t => t.toLowerCase() === 'all');
      let targetTactics = hasAll ? MITRE_TACTICS_LIST : uc.data.tactics;
      targetTactics.forEach(tactic => {
        if (uniqueTactics.includes(tactic)) {
          links.push({ source: uc.id, target: tactic });
        }
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(hasAll => hasAll ? 200 : 150))
      .force("charge", d3.forceManyBody().strength((d: any) => d.type === 'tactic' ? -1000 : -200)) 
      .force("collide", d3.forceCollide().radius((d: any) => d.radius + 10).iterations(2))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.01))
      .force("y", d3.forceY(height / 2).strength(0.01));

    const g = svg.append("g").attr("class", "graph-container");

    svg.on("click", (e) => {
        if (e.target === svgRef.current) {
            onSelectUseCase(null); 
        }
    });

    const link = g.append("g")
      .attr("stroke", "#004254") 
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "graph-link") 
      .attr("stroke-width", 1);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", d => d.type === 'usecase' ? "node-usecase" : "node-tactic") 
      .call(drag(simulation) as any);

    node.filter(d => d.type === 'usecase')
      .append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => categoryColors[d.data.category || 'Unknown'] || '#94A3B8')
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelectUseCase(d.data);
      });

    node.filter(d => d.type === 'tactic')
      .append("text")
      .text(d => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#c63f1f") 
      .attr("font-size", "14px")
      .attr("font-weight", "800")
      .style("cursor", "pointer")
      .style("text-shadow", "0 2px 4px rgba(255,255,255,0.9)")
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelectTactic(d.id);
      });

    node.filter(d => d.type === 'usecase')
      .append("text")
      .text(d => d.id) 
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#001923") 
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .style("pointer-events", "none")
      .style("text-shadow", "0px 0px 2px rgba(255,255,255,0.3)");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    function drag(simulation: d3.Simulation<GraphNode, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

  }, [data, dimensions, categoryColors]); 


  useEffect(() => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      const svg = d3.select(svgRef.current);
      
      const nodeGroups = svg.selectAll<SVGGElement, GraphNode>("g.node-usecase, g.node-tactic");
      const links = svg.selectAll<SVGLineElement, GraphLink>("line.graph-link");
      
      nodeGroups.style("opacity", 1);
      links.style("stroke-opacity", 0.1);
      nodeGroups.filter((d) => d.type === 'usecase').select("circle").attr("stroke-width", 1.5);

      let nodesToZoom: GraphNode[] = [];

      if (currentSelection) {
        if (currentSelection.type === 'usecase') {
            const selectedId = currentSelection.data.id;
            const ucData = currentSelection.data;
            const hasAll = ucData.tactics.some(t => t.toLowerCase() === 'all');

            nodeGroups.style("opacity", (d) => {
                if (d.id === selectedId) {
                    nodesToZoom.push(d); 
                    return 1;
                }
                
                if (d.type === 'tactic') {
                    if (hasAll) {
                         nodesToZoom.push(d); 
                         return 1;
                    }
                    if (ucData.tactics.includes(d.id)) {
                        nodesToZoom.push(d); 
                        return 1;
                    }
                    return 0.1;
                }
                
                return 0.1; 
            });

            nodeGroups.filter((d) => d.id === selectedId)
                .select("circle")
                .attr("stroke-width", 4);
                
        } else if (currentSelection.type === 'tactic') {
            const tacticId = currentSelection.id;

            nodeGroups.style("opacity", (d) => {
                if (d.id === tacticId) {
                    nodesToZoom.push(d); 
                    return 1;
                }
                
                if (d.type === 'usecase') {
                     const hasAll = d.data.tactics.some((t: string) => t.toLowerCase() === 'all');
                     if (hasAll || d.data.tactics.includes(tacticId)) {
                         nodesToZoom.push(d); 
                         return 1;
                     }
                     return 0.1;
                }
                return 0.1;
            });

            links.style("stroke-opacity", (l: any) => {
                const targetId = (l.target as GraphNode).id;
                return targetId === tacticId ? 0.4 : 0.02;
            });
        }

        if (nodesToZoom.length > 0 && !isCapturing) {
             const padding = 100;
             const minX = d3.min(nodesToZoom, d => d.x!)! - padding;
             const maxX = d3.max(nodesToZoom, d => d.x!)! + padding;
             const minY = d3.min(nodesToZoom, d => d.y!)! - padding;
             const maxY = d3.max(nodesToZoom, d => d.y!)! + padding;

             const width = maxX - minX;
             const height = maxY - minY;

             if (width > 0 && height > 0) {
                 const scale = Math.min(2.5, 0.8 / Math.max(width / dimensions.width, height / dimensions.height));
                 const tx = dimensions.width / 2 - scale * (minX + width / 2);
                 const ty = dimensions.height / 2 - scale * (minY + height / 2);

                 svg.transition().duration(750).call(
                     zoomBehaviorRef.current.transform,
                     d3.zoomIdentity.translate(tx, ty).scale(scale)
                 );
             }
        }

      } else {
         if(!isCapturing) {
             svg.transition().duration(750).call(
                 zoomBehaviorRef.current.transform,
                 d3.zoomIdentity
             );
         }
      }

  }, [currentSelection, dimensions, isCapturing]);

  const activeId = currentSelection?.type === 'usecase' ? currentSelection.data.id : null;

  return (
    <div 
        ref={wrapperRef} 
        className={`mv-root w-full h-full bg-transparent rounded-xl shadow-lg border border-brand-grey/50 ${isCapturing ? 'flex flex-row overflow-hidden' : 'relative overflow-hidden'}`}
    >
        {isCapturing && (
            <>
                <div style={{ width: `${leftPanelWidth}%` }} className="mv-panel flex flex-col h-full bg-white/50">
                    <div className="bg-brand-amazon flex items-center justify-between px-3 py-2 flex-shrink-0">
                        <h3 className={`text-white font-bold uppercase tracking-wider ${fontClasses.header}`}>
                            Use Case Catalog
                        </h3>
                        <button 
                            onClick={() => setFontLevel((prev) => (prev + 1) % 3)}
                            className="bg-white/20 hover:bg-white/40 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors"
                            title="Toggle Font Size"
                        >
                            Aa
                        </button>
                    </div>
                    <div className="mv-scroll-content flex-1 grid grid-cols-2 gap-x-4 gap-y-2 content-start overflow-y-auto px-2 pt-2">
                        {data.map(uc => (
                            <div key={uc.id} className="border-l-4 border-brand-grey pl-2 py-1 break-inside-avoid">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span 
                                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                                        style={{ backgroundColor: categoryColors[uc.category || 'Unknown'] }}
                                    ></span>
                                    <span className={`font-bold text-brand-dark/70 ${fontClasses.sub}`}>{uc.id}</span>
                                    <span className={`text-brand-grey text-[10px] bg-brand-amazon px-1 rounded ml-auto ${fontLevel === 2 ? 'opacity-100' : 'opacity-0'}`}>
                                        {uc.category}
                                    </span>
                                </div>
                                <p className={`text-gray-900 font-medium ${fontClasses.list}`}>{uc.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div 
                    className="w-3 bg-brand-grey/30 hover:bg-brand-turq/50 cursor-col-resize flex items-center justify-center z-20 group transition-colors border-r border-l border-white/50"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        isDraggingLeft.current = true;
                        document.body.style.cursor = 'col-resize';
                    }}
                >
                     <div className="w-1 h-6 bg-brand-amazon/30 group-hover:bg-brand-dark rounded-full"></div>
                </div>
            </>
        )}

        <div ref={graphContainerRef} className={`relative flex-1 flex flex-col ${isCapturing ? 'h-full bg-white/20' : 'w-full h-full'}`}>
            <div className={`flex items-start justify-between z-10 ${isCapturing ? 'mb-1 text-center pt-2 px-2' : 'absolute top-4 left-4 right-4 pointer-events-none'}`}>
                <div className={`pointer-events-auto ${isCapturing ? 'flex-1 text-center' : ''}`}>
                    {isEditingTitle ? (
                        <input 
                            type="text" 
                            value={customTitle} 
                            onChange={(e) => setCustomTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                            autoFocus
                            className={`text-2xl font-bold text-brand-dark bg-transparent border-b-2 border-brand-turq outline-none w-full max-w-md ${isCapturing ? 'text-center' : ''}`}
                        />
                    ) : (
                        <h2 
                            onClick={() => setIsEditingTitle(true)}
                            className="text-2xl font-bold text-brand-dark cursor-pointer hover:text-brand-turq transition-colors border-b-2 border-transparent hover:border-brand-turq/50 inline-block"
                        >
                            {customTitle}
                        </h2>
                    )}
                    
                    {!isCapturing && (
                        <p className="text-sm text-brand-amazon mb-4 pointer-events-auto">
                            {currentSelection?.type === 'tactic'
                            ? `Focusing on: ${currentSelection.id}` 
                            : 'Multi-Tactic Correlation View'}
                        </p>
                    )}
                </div>

                 <button 
                    onClick={handleFitToScreen}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-brand-amazon hover:text-brand-turq transition-all pointer-events-auto flex-shrink-0 ml-2"
                    title="Fit to Screen"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                 </button>
            </div>

            <div className="flex-1 relative">
                 <svg ref={svgRef} className="w-full h-full block absolute inset-0" />
            </div>

            {isCapturing && (
                <div className="h-8 bg-brand-amazon text-white flex items-center justify-end px-4 text-xs font-bold uppercase tracking-wider">
                    Total Use Cases: {data.length}
                </div>
            )}
        </div>

        {isCapturing && (
            <>
                 <div 
                    className="w-3 bg-brand-grey/30 hover:bg-brand-turq/50 cursor-col-resize flex items-center justify-center z-20 group transition-colors border-r border-l border-white/50"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        isDraggingRight.current = true;
                        document.body.style.cursor = 'col-resize';
                    }}
                >
                     <div className="w-1 h-6 bg-brand-amazon/30 group-hover:bg-brand-dark rounded-full"></div>
                </div>

                <div style={{ width: `${rightPanelWidth}%` }} className="mv-panel flex flex-col h-full bg-white/50">
                    <div className="bg-brand-dark flex items-center justify-between px-3 py-2 flex-shrink-0">
                         <h3 className={`text-white font-bold uppercase tracking-wider ${fontClasses.header}`}>
                            Tactic Stats
                        </h3>
                        <button 
                            onClick={() => setFontLevel((prev) => (prev + 1) % 3)}
                            className="bg-white/20 hover:bg-white/40 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors"
                            title="Toggle Font Size"
                        >
                            Aa
                        </button>
                    </div>
                   
                    <div className="mv-scroll-content flex-1 px-2 overflow-y-auto pt-2">
                        {MITRE_TACTICS_LIST.map(tactic => (
                            <div key={tactic} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                <span className={`text-brand-amazon font-medium truncate pr-1 ${fontClasses.list}`}>{tactic}</span>
                                <span className={`bg-brand-grey text-brand-dark px-2 rounded-full font-bold ${fontClasses.sub}`}>
                                    {tacticStats[tactic]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
             </>
        )}


        {!isCapturing && (
            <div className="absolute top-24 left-4 z-10 w-72 bottom-4 flex flex-col gap-4 pointer-events-none">
                
                <div className="flex-1 bg-white/90 backdrop-blur-sm shadow-md rounded-lg border border-brand-grey/50 overflow-hidden pointer-events-auto flex flex-col">
                    <h3 className="bg-brand-amazon text-white px-3 py-2 text-xs font-bold uppercase tracking-wider">
                        Use Cases
                    </h3>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {data.map(uc => (
                            <div 
                                key={uc.id} 
                                onClick={() => onSelectUseCase(uc)}
                                className={`
                                    cursor-pointer px-2 py-1.5 rounded text-xs border-l-2 transition-all
                                    ${activeId === uc.id 
                                        ? 'bg-brand-turq/10 border-brand-turq text-brand-dark font-semibold' 
                                        : 'border-transparent text-gray-600 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span 
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: categoryColors[uc.category || 'Unknown'] }}
                                    ></span>
                                    <span className="opacity-70 text-[10px]">{uc.id}</span>
                                </div>
                                <p className="line-clamp-2 leading-tight">{uc.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-1/3 min-h-[150px] bg-white/90 backdrop-blur-sm shadow-md rounded-lg border border-brand-grey/50 overflow-hidden pointer-events-auto flex flex-col">
                    <h3 className="bg-brand-dark text-white px-3 py-2 text-xs font-bold uppercase tracking-wider">
                        Tactic Stats
                    </h3>
                    <div className="overflow-y-auto flex-1 p-2">
                        {MITRE_TACTICS_LIST.map(tactic => (
                            <div 
                                key={tactic} 
                                onClick={() => onSelectTactic(tactic)}
                                className={`flex items-center justify-between py-1 border-b border-gray-100 last:border-0 text-xs cursor-pointer hover:bg-brand-grey/20 px-1 rounded transition-colors
                                    ${currentSelection?.type === 'tactic' && currentSelection.id === tactic ? 'bg-brand-turq/20' : ''}
                                `}
                            >
                                <span className="text-brand-amazon font-medium truncate pr-2">{tactic}</span>
                                <span className="bg-brand-grey text-brand-dark px-1.5 rounded font-bold text-[10px]">
                                    {tacticStats[tactic]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MitreViz;