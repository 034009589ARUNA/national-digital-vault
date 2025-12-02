import './SimpleChart.css';

const SimpleChart = ({ data, title, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="simple-chart">
        <h4 className="chart-title">{title}</h4>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value || item.count || 0));

  return (
    <div className="simple-chart">
      <h4 className="chart-title">{title}</h4>
      <div className="chart-container">
        {type === 'bar' && (
          <div className="bar-chart">
            {data.map((item, index) => {
              const value = item.value || item.count || 0;
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const label = item.label || item._id || item.name || `Item ${index + 1}`;
              
              return (
                <div key={index} className="bar-item">
                  <div className="bar-label">{label}</div>
                  <div className="bar-wrapper">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                      data-value={value}
                    >
                      <span className="bar-value">{value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {type === 'pie' && (
          <div className="pie-chart">
            {data.map((item, index) => {
              const value = item.value || item.count || 0;
              const total = data.reduce((sum, d) => sum + (d.value || d.count || 0), 0);
              const percentage = total > 0 ? (value / total) * 100 : 0;
              const label = item.label || item._id || item.name || `Item ${index + 1}`;
              const colors = [
                'var(--accent-primary)',
                'var(--accent-secondary)',
                '#8b5cf6',
                '#f59e0b',
                '#ef4444'
              ];
              
              return (
                <div key={index} className="pie-item">
                  <div 
                    className="pie-color" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <div className="pie-info">
                    <span className="pie-label">{label}</span>
                    <span className="pie-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                  <span className="pie-value">{value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleChart;

