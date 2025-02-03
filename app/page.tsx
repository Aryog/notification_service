"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TokenList } from "@/components/TokenList";
import useFcmToken from "@/hooks/useFcmToken";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Home() {
  const { token, notificationPermissionStatus } = useFcmToken();
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    link: "/contact",
  });

  const handleTestNotification = async () => {
    if (selectedTokens.length === 0) {
      toast.error("Please select at least one device to send notification to");
      return;
    }

    try {
      // Send notification to all selected tokens
      const responses = await Promise.all(
        selectedTokens.map(token =>
          fetch("/send-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              ...notificationData,
            }),
          })
        )
      );

      const results = await Promise.all(responses.map(r => r.json()));

      const successCount = results.filter(r => r.success).length;
      toast.success(`Notification sent to ${successCount} devices`);

      // Clear the form after sending
      setNotificationData({
        title: "",
        message: "",
        link: "/contact",
      });
    } catch (error) {
      toast.error("Failed to send notifications");
      console.error(error);
    }
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

      <div className="grid gap-8">
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
            disabled={!selectedTokens.length || !notificationData.title || !notificationData.message}
            className="w-full"
            onClick={handleTestNotification}
          >
            Send to Selected Devices ({selectedTokens.length})
          </Button>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Manage Devices</h2>
          <TokenList
            currentToken={token}
            onSelectTokens={setSelectedTokens}
          />
        </div>
      </div>
    </main>
  );
}
