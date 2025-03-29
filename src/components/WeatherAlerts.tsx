import React, { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { WeatherAlert } from '../types';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts }) => {
  const [visibleAlerts, setVisibleAlerts] = useState<boolean[]>(alerts.map(() => false));
  const [dismissedAlerts, setDismissedAlerts] = useState<boolean[]>(alerts.map(() => false));
  
  const toggleAlert = (index: number) => {
    const newVisibleAlerts = [...visibleAlerts];
    newVisibleAlerts[index] = !newVisibleAlerts[index];
    setVisibleAlerts(newVisibleAlerts);
  };
  
  const dismissAlert = (index: number) => {
    const newDismissedAlerts = [...dismissedAlerts];
    newDismissedAlerts[index] = true;
    setDismissedAlerts(newDismissedAlerts);
  };

  // Get the severity color
  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'extreme':
        return 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300';
      case 'moderate':
        return 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-300';
      default:
        return 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300';
    }
  };

  if (alerts.length === 0 || dismissedAlerts.every(d => d)) {
    return null;
  }

  return (
    <div className="mb-6">
      {alerts.map((alert, index) => {
        if (dismissedAlerts[index]) return null;
        
        const severityClass = getSeverityColor(alert.severity);
        const startTime = format(new Date(alert.start * 1000), 'MMM d, h:mm a');
        const endTime = format(new Date(alert.end * 1000), 'MMM d, h:mm a');
        
        return (
          <div 
            key={index} 
            className={`${severityClass} border rounded-lg p-4 mb-2 transition-all`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-bold">{alert.event}</h3>
                  <p className="text-sm">
                    {startTime} — {endTime}
                  </p>
                  <p className="text-sm mt-1">
                    Issued by: {alert.senderName}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => toggleAlert(index)} 
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                  aria-label={visibleAlerts[index] ? "Collapse alert" : "Expand alert"}
                >
                  {visibleAlerts[index] ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                
                <button 
                  onClick={() => dismissAlert(index)}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                  aria-label="Dismiss alert"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {visibleAlerts[index] && (
              <div className="mt-3 text-sm whitespace-pre-line">
                {alert.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 