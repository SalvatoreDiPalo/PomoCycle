import { AddActivityFromPomo } from "../../wailsjs/go/backend/App";
import { LogDebug, LogError } from "../../wailsjs/runtime/runtime";

export const AddActivity = async (
  sessionId: number,
  operation: number,
  onSuccess: () => void
) => {
  try {
    const activityId = await AddActivityFromPomo({
      operation,
      session_id: sessionId,
      timestamp: new Date().getTime(),
    });
    console.log("Activity id", activityId);
    LogDebug("Added activity");
    onSuccess();
  } catch (err) {
    console.error("Error while adding activity", err);
    LogError("Error while adding activity");
  }
};
