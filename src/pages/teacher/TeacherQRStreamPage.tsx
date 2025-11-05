import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, RefreshCw, QrCode as QrCodeIcon } from "lucide-react";
import QRCode from "qrcode";
import { apiClient } from "@/lib/api";

export default function TeacherQRStreamPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [currentQRData, setCurrentQRData] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scheduleId) {
      setScheduleId(location.state.scheduleId);
    } else {
      setError("Schedule ID is required");
    }
  }, [location]);

  useEffect(() => {
    if (scheduleId) {
      startQRStream();
    }

    return () => {
      stopQRStream();
    };
  }, [scheduleId]);

  const startQRStream = async () => {
    if (!scheduleId) return;

    try {
      setIsStreaming(true);
      setError("");

      const response = await apiClient.startQRStream({
        schedule_id: scheduleId,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data && data !== "[DONE]") {
                    setCurrentQRData(data);
                    const qrDataUrl = await QRCode.toDataURL(data, {
                      width: 400,
                      margin: 2,
                    });
                    setQrDataUrl(qrDataUrl);
                  }
                }
              }
            }
          } catch (err) {
            console.error("Stream reading error:", err);
            setError("Stream interrupted");
          }
        };

        readStream();
      }
    } catch (err: any) {
      setError(err.message || "Failed to start QR stream");
      setIsStreaming(false);
    }
  };

  const stopQRStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleRefresh = () => {
    stopQRStream();
    setQrDataUrl("");
    setCurrentQRData("");
    setTimeout(() => {
      startQRStream();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button
          onClick={() => {
            stopQRStream();
            navigate("/teacher/schedule");
          }}
          variant="ghost"
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schedule
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-6 w-6" />
              QR Code Stream
            </CardTitle>
            <CardDescription>
              Display this QR code for students to scan for attendance
              {scheduleId && ` (Schedule ID: ${scheduleId})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {qrDataUrl ? (
                    <>
                      <div className="relative">
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          className="w-80 h-80 border-4 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg"
                        />
                        {isStreaming && (
                          <div className="absolute -top-2 -right-2">
                            <span className="flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Current QR Code:
                        </p>
                        <code className="text-xs px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md block break-all">
                          {currentQRData}
                        </code>
                      </div>
                    </>
                  ) : (
                    <div className="w-80 h-80 border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <RefreshCw className="h-12 w-12 mx-auto text-zinc-400 animate-spin" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Generating QR Code...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="gap-2"
                    disabled={!isStreaming}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Stream
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Instructions:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>
                      Students should scan this QR code to mark their attendance
                    </li>
                    <li>The QR code updates automatically for security</li>
                    <li>
                      Make sure the code is clearly visible to all students
                    </li>
                    <li>Keep this page open during the class</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
