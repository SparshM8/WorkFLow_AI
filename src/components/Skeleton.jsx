import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className, width, height, circle, style }) => {
  const styles = {
    ...style,
    width,
    height,
    borderRadius: circle ? '50%' : 'var(--radius-sm, 6px)'
  };

  return (
    <div 
      className={`skeleton-loader ${className || ''}`} 
      style={styles}
    ></div>
  );
};

export default Skeleton;
