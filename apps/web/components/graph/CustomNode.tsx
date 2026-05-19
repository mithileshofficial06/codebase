'use client';

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';
import { useFlowStore } from '@/store/flowStore';

export type NodeType = 'core' | 'hotspot' | 'stable' | 'utility';

const TYPE_GLOW: Record<NodeType, string> = {
  core:    '0 0 8px 2px rgba(59,130,246,0.4)',
  hotspot: '0 0 10px 3px rgba(239,68,68,0.5)',
  stable:  '0 0 6px 2px rgba(16,185,129,0.3)',
  utility: '0 0 3px 1px rgba(75,85,99,0.2)',
};

function CustomNodeComponent({ id, data, selected }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const activeFilter = useGraphStore((s) => s.activeFilter);
  const focusedNodeId = useGraphStore((s) => s.focusedNodeId);
  const setSelectedNode = useGraphStore((s) => s.setSelectedNode);
  const setFocusedNode = useGraphStore((s) => s.setFocusedNode);
  
  // Flow visualization state
  const { activeFlow, currentStepIndex, playbackState } = useFlowStore();

  const nodeType: NodeType = data.nodeType || 'utility';
  const extColor: string = data.extColor || '#4b5563';
  
  // Flow logic
  const isInFlow = activeFlow?.steps.some(s => s.nodeId === id);
  const currentFlowStep = activeFlow?.steps[currentStepIndex];
  const isCurrentStep = currentFlowStep?.nodeId === id;
  const isPastStep = activeFlow?.steps.slice(0, currentStepIndex).some(s => s.nodeId === id);
  const isFutureStep = activeFlow?.steps.slice(currentStepIndex + 1).some(s => s.nodeId === id);
  const isFlowActive = playbackState !== 'idle' && activeFlow;
  
  // Focus mode logic
  const isFocused = focusedNodeId === id;
  const isConnected = focusedNodeId && (
    data.dependencies?.includes(focusedNodeId) || 
    data.dependents?.includes(focusedNodeId)
  );
  const shouldDim = focusedNodeId && !isFocused && !isConnected;
  
  // Filter dimming
  const isFilterDimmed = activeFilter !== 'all' && activeFilter !== nodeType;
  
  // Combined dimming logic
  const isDimmed = shouldDim || isFilterDimmed || (isFlowActive && !isInFlow);

  const scale = isCurrentStep ? 1.4 : isFocused ? 1.3 : selected ? 1.15 : isHovered ? 1.08 : isDimmed ? 0.85 : 1;
  const opacity = isDimmed ? 0.08 : isPastStep ? 0.5 : isFutureStep ? 0.3 : isConnected ? 0.7 : 1;
  const zIndex = isCurrentStep ? 200 : isFocused ? 100 : selected ? 50 : isHovered ? 10 : 1;

  // Adaptive radius based on connectivity
  const connections = (data.dependencies?.length || 0) + (data.dependents?.length || 0);
  const radius = Math.max(6, Math.min(14, 6 + connections * 1.5));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setSelectedNode({
          id,
          label: data.label,
          nodeType: data.nodeType,
          commitFrequency: data.commitFrequency,
          size: data.fileSize,
          path: data.path,
          dependencies: data.dependencies || [],
          dependents: data.dependents || [],
        } as any);
      }}
      onDoubleClick={() => {
        // Double-click to enter focus mode
        setFocusedNode(id);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transform: `scale(${scale})`,
        opacity,
        transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease',
        zIndex,
        position: 'relative',
      }}
    >
      {/* Invisible handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      {/* Node circle */}
      <div style={{ position: 'relative' }}>
        {/* Flow current step mega glow */}
        {isCurrentStep && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${extColor}80 0%, transparent 70%)`,
                filter: 'blur(12px)',
                animation: 'flow-pulse 1.5s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: `3px solid ${extColor}`,
                animation: 'flow-ring-pulse 2s ease-out infinite',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
        
        {/* Focus glow bloom */}
        {isFocused && !isCurrentStep && (
          <div
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${extColor}60 0%, transparent 70%)`,
              filter: 'blur(8px)',
              animation: 'focus-pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
        
        <div
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            backgroundColor: extColor,
            position: 'relative',
            boxShadow: isCurrentStep
              ? `0 0 30px 10px ${extColor}, ${TYPE_GLOW[nodeType]}`
              : isFocused
              ? `0 0 20px 6px ${extColor}80, ${TYPE_GLOW[nodeType]}`
              : isHovered || selected
              ? TYPE_GLOW[nodeType]
              : `0 0 4px 1px ${extColor}40`,
            border: isCurrentStep
              ? `4px solid ${extColor}`
              : isFocused 
              ? `3px solid ${extColor}` 
              : selected 
              ? '2px solid #ffffff' 
              : `1px solid ${extColor}80`,
            transition: 'box-shadow 400ms ease, border 400ms ease',
          }}
        >
          {/* Glass texture overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
              pointerEvents: 'none',
            }}
          />
          
          {/* Inner highlight */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '20%',
              width: '40%',
              height: '40%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
              opacity: isHovered || selected || isFocused ? 0.8 : 0.4,
              transition: 'opacity 400ms ease',
            }}
          />
        </div>

        {/* Hotspot pulsing ring */}
        {nodeType === 'hotspot' && (
          <div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              border: `1.5px solid ${extColor}`,
              animation: 'hotspot-pulse 2s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Label — always visible */}
      <div
        style={{
          marginTop: 6,
          fontFamily: '"Geist Mono", "SF Mono", "Monaco", "Cascadia Code", monospace',
          fontSize: 10,
          fontWeight: 500,
          color: selected ? '#ffffff' : isHovered ? '#e5e5e5' : '#b3b3b3',
          backgroundColor: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '2px 6px',
          borderRadius: 4,
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 200ms ease, background-color 200ms ease',
          letterSpacing: '-0.02em',
          border: selected ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)',
        }}
        title={data.path || data.label}
      >
        {data.label}
      </div>

      {/* Folder path shown on hover */}
      {isHovered && data.folder && data.folder !== '_root' && (
        <div
          style={{
            marginTop: 2,
            fontSize: 8,
            color: '#777',
            fontFamily: '"Geist Mono", "SF Mono", "Monaco", monospace',
            backgroundColor: 'rgba(8,8,8,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '1px 5px',
            borderRadius: 3,
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          {data.folder}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      <style>{`
        @keyframes hotspot-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes focus-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes flow-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes flow-ring-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
CustomNode.displayName = 'CustomNode';
export default CustomNode;
