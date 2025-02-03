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
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Firebase Cloud Messaging Demo
          </h1>
          {notificationPermissionStatus === "granted" ? (
            <p className="text-emerald-400">
              ✓ Notifications enabled
            </p>
          ) : notificationPermissionStatus !== null ? (
            <p className="text-yellow-400">
              ⚠️ Please enable notifications in your browser settings
            </p>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Send Notification</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1 text-muted-foreground">
                    Notification Title
                  </label>
                  <Input
                    id="title"
                    value={notificationData.title}
                    onChange={(e) =>
                      setNotificationData(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter notification title"
                    className="bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1 text-muted-foreground">
                    Notification Message
                  </label>
                  <Textarea
                    id="message"
                    value={notificationData.message}
                    onChange={(e) =>
                      setNotificationData(prev => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Enter your notification message"
                    className="min-h-[100px] bg-background"
                  />
                </div>

                <Button
                  disabled={!selectedTokens.length || !notificationData.title || !notificationData.message}
                  className="w-full text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
                  onClick={handleTestNotification}
                >
                  {!selectedTokens.length
                    ? "Select devices to send notification"
                    : `Send to Selected Devices (${selectedTokens.length})`
                  }
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Manage Devices</h2>
              <TokenList
                currentToken={token}
                onSelectTokens={setSelectedTokens}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
