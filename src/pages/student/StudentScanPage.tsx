import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Camera, Check, X } from "lucide-react";

export default function StudentScanPage() {
  const [qrData, setQrData] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get schedule ID from navigation state if availabl
    if (location.state?.scheduleId) {
      setScheduleId(location.state.scheduleId.toString());
    }
  }, [location]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSimulator = isIOS && (
        navigator.userAgent.includes('Simulator') || 
        navigator.maxTouchPoints === 0
      );
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (isSimulator) {
        setError(
          "📱 iOS Simulator does not support camera. Please use a real iPhone or manual QR code entry below."
        );
        return;
      }
      
      if (isIOS && !isHTTPS) {
        setError(
          "Camera on iPhone requires HTTPS. Please use the manual QR code entry below."
        );
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          "Camera not supported on this device. Please use manual QR code entry."
        );
        return;
      }

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        streamRef.current = stream;
        setUseCamera(true);
        setError("");
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      
      let errorMessage = "Failed to access camera. ";
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera permissions in your browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMessage += "Camera is already in use by another app.";
      } else {
        errorMessage += "Please use manual QR code entry below.";
      }
      
      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseCamera(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.scanQR({
        qr_data: qrData,
        schedule_id: parseInt(scheduleId),
      });

      setSuccess(true);
      setError("");

      // Stop camera after successful scan
      if (useCamera) {
        stopCamera();
      }

      // Reset form
      setTimeout(() => {
        navigate("/student/schedule");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to submit QR code. Please try again."
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          onClick={() => navigate("/student/schedule")}
          variant="ghost"
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schedule
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Scan the QR code displayed by your teacher to mark your attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isSimulator = isIOS && (navigator.userAgent.includes('Simulator') || navigator.maxTouchPoints === 0);
              const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
              
              if (isSimulator) {
                return (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      📱 <strong>iOS Simulator:</strong> Camera is not supported in simulator. Test on a real iPhone or use manual entry below.
                    </p>
                  </div>
                );
              }
              
              if (isIOS && !isHTTPS) {
                return (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      📱 <strong>iPhone Users:</strong> Camera requires HTTPS connection. Please use manual QR code entry below.
                    </p>
                  </div>
                );
              }
              
              return null;
            })()}
            <form onSubmit={handleSubmit} className="space-y-6">
              {useCamera ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div className="text-sm text-center text-zinc-600 dark:text-zinc-400">
                    Position the QR code within the frame
                  </div>
                  <Button
                    type="button"
                    onClick={stopCamera}
                    variant="outline"
                    className="w-full"
                  >
                    Stop Camera & Enter Manually
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={startCamera}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Use Camera
                </Button>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr_data">QR Code Data</Label>
                  <Input
                    id="qr_data"
                    type="text"
                    placeholder="Enter QR code data"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    You can manually enter the QR code if scanning doesn't work
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule_id">Schedule ID</Label>
                  <Input
                    id="schedule_id"
                    type="number"
                    placeholder="Enter schedule ID"
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    required
                  />
                </div>
              </div>

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-md flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <span>Attendance marked successfully! Redirecting...</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-md flex items-center gap-2">
                  <X className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || success}
              >
                {loading
                  ? "Submitting..."
                  : success
                  ? "Success!"
                  : "Submit Attendance"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
