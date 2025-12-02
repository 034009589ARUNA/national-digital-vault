import { useState, useEffect } from 'react';
import api from '../api/api';
import './ActivityFeed.css';

const ActivityFeed = ({ limit = 10, userId = null }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [limit, userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an activity/audit log endpoint
      // For now, we'll simulate with document history
      const response = await api.get('/documents');
      const documents = response.data || [];
      
      // Transform documents into activities
      const activityList = documents.slice(0, limit).map(doc => ({
        id: doc._id,
        type: doc.isVerified ? 'verified' : 'uploaded',
        title: doc.filename,
        description: doc.isVerified 
          ? 'Document verified and stored on blockchain'
          : 'Document uploaded, pending verification',
        timestamp: doc.timestamp,
        icon: doc.isVerified ? '✅' : '📄',
        hash: doc.hash
      }));

      setActivities(activityList);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Use mock data for demo
      setActivities([
        {
          id: 1,
          type: 'verified',
          title: 'Birth Certificate Verified',
          description: 'Document verified by Birth & Deaths Office',
          timestamp: new Date().toISOString(),
          icon: '✅'
        },
        {
          id: 2,
          type: 'uploaded',
          title: 'Property Deed Uploaded',
          description: 'New document uploaded to vault',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          icon: '📄'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="activity-feed">
        <h3 className="activity-feed-title">Recent Activity</h3>
        <div className="activity-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="activity-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <h3 className="activity-feed-title">Recent Activity</h3>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="activity-empty">
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="activity-item" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <h4 className="activity-title">{activity.title}</h4>
                <p className="activity-description">{activity.description}</p>
                <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

