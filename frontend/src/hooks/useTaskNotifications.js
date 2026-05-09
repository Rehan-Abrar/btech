// src/hooks/useTaskNotifications.js

import { useEffect, useRef } from "react";

export default function useTaskNotifications(tasks = []) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    // Browser support check
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return;
    }

    // Ask permission once
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkDeadlines = () => {
      const now = new Date();

      tasks.forEach((task) => {
        if (!task?.due) return;

        // Create due date
        const dueDate = new Date(task.due);

        // Difference in minutes
        const diffMinutes = Math.floor(
          (dueDate.getTime() - now.getTime()) / 60000
        );

        // Notify 30 mins before
        const shouldNotify = diffMinutes <= 30 && diffMinutes > 0;

        const alreadyNotified = notifiedRef.current.has(task.id);

        if (
          shouldNotify &&
          !alreadyNotified &&
          Notification.permission === "granted"
        ) {
          const notification = new Notification(
            "⚡ AXON Task Reminder",
            {
              body: `${task.title} is due in ${diffMinutes} minutes`,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: `task-${task.id}`,
            }
          );

          notification.onclick = () => {
            window.focus();
          };

          notifiedRef.current.add(task.id);
        }
      });
    };

    // Run immediately
    checkDeadlines();

    // Check every minute
    const interval = setInterval(checkDeadlines, 60000);

    return () => clearInterval(interval);
  }, [tasks]);
}
