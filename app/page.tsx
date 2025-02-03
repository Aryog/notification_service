"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useFcmToken from "@/hooks/useFcmToken";
import { useState } from "react";

export default function Home() {
  const { token, notificationPermissionStatus } = useFcmToken();
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    link: "/contact",
  });

  const handleTestNotification = async () => {
    const response = await fetch("/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        ...notificationData,
      }),
    });

    const data = await response.json();
    console.log(data);

    // Clear the form after sending
    setNotificationData({
      title: "",
      message: "",
      link: "/contact",
    });
  };

  return (
    <main className="p-10">
      <h1 className="text-4xl mb-4 font-bold">Firebase Cloud Messaging Demo</h1>

      {notificationPermissionStatus === "granted" ? (
        <p className="mb-4">Permission to receive notifications has been granted.</p>
      ) : notificationPermissionStatus !== null ? (
        <p className="mb-4">
          You have not granted permission to receive notifications. Please
          enable notifications in your browser settings.
        </p>
      ) : null}

      <div className="max-w-md space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Notification Title
          </label>
          <Input
            id="title"
            value={notificationData.title}
            onChange={(e) =>
              setNotificationData(prev => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter notification title"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Notification Message
          </label>
          <Textarea
            id="message"
            value={notificationData.message}
            onChange={(e) =>
              setNotificationData(prev => ({ ...prev, message: e.target.value }))
            }
            placeholder="Enter your notification message"
            className="min-h-[100px]"
          />
        </div>

        <Button
          disabled={!token || !notificationData.title || !notificationData.message}
          className="w-full"
          onClick={handleTestNotification}
        >
          Send Custom Notification
        </Button>
      </div>
    </main>
  );
}
