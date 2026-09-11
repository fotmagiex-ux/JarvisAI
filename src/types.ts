export type JarvisState =
  | "IDLE"
  | "LISTENING"
  | "UNDERSTANDING"
  | "PLANNING"
  | "WAITING_FOR_CONFIRMATION"
  | "EXECUTING"
  | "OBSERVING"
  | "VERIFYING"
  | "RECOVERING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type LanguageMode = "auto" | "bn" | "en" | "banglish";

export type OperationMode = "online" | "offline";

export interface IntentParameters {
  query?: string;
  recipient?: string;
  message?: string;
  direction?: "UP" | "DOWN";
  action?: string;
  target?: string;
}

export interface IntentData {
  intent: string;
  application: string;
  appName: string;
  parameters: IntentParameters;
  requires_confirmation: boolean;
  confirmation_prompt?: string;
  confirmation_prompt_bn?: string;
  voice_response: string;
  voice_response_bn?: string;
  plan_summary: string[];
  confidence?: number;
  targetApp?: string;
}

export type IntentAnalysis = IntentData;

export interface TaskPlan {
  app: string;
  steps: TaskStep[];
}

export type ActionType =
  | "OPEN_APP"
  | "FIND_AND_CLICK"
  | "TYPE_TEXT"
  | "SUBMIT"
  | "WAIT_AND_OBSERVE"
  | "VERIFY_ELEMENT"
  | "REQUEST_CONFIRMATION"
  | "SCROLL"
  | "SYSTEM_NAV"
  | "LAUNCH_APP"
  | "CLICK_NODE"
  | "GLOBAL_BACK"
  | "GLOBAL_HOME";

export interface TargetElement {
  text?: string;
  resourceId?: string;
  contentDescription?: string;
  className?: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface TaskStep {
  id: string;
  title: string;
  title_bn: string;
  actionType: ActionType;
  targetElement?: TargetElement;
  inputValue?: string;
  verificationCriteria: string;
  status: "pending" | "active" | "completed" | "failed";
  maxRetries: number;
  currentRetry?: number;
  verifiedTimestamp?: number;
  requiresConfirmation?: boolean;
  targetApp?: string;
  targetNodeId?: string;
  recipient?: string;
  inputText?: string;
}

export interface UIElement {
  id: string;
  resourceId: string;
  text: string;
  contentDescription: string;
  className: string;
  bounds: { x: number; y: number; width: number; height: number };
  isClickable: boolean;
  isEditable: boolean;
  isScrollable: boolean;
}

export interface ScreenContext {
  packageName: string;
  appName: string;
  visibleText: string[];
  clickableElements: UIElement[];
  editableElements: UIElement[];
  scrollableElements: UIElement[];
  timestamp: number;
}

export type AuditLogLevel = "info" | "action" | "verify" | "alert" | "error";

export interface AuditLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  message_bn?: string;
  level: AuditLogLevel;
  details?: any;
}

export interface OfflineCommand {
  id: string;
  name: string;
  triggers: string[];
  action:
    | "GO_HOME"
    | "GO_BACK"
    | "SCROLL_UP"
    | "SCROLL_DOWN"
    | "VOLUME_UP"
    | "VOLUME_DOWN"
    | "LOCK_SCREEN"
    | string;
  category: "navigation" | "device_control" | "media" | "custom";
  feedback_en: string;
  feedback_bn: string;
  isCustom?: boolean;
}

export type FailureReason =
  | "NODE_NOT_FOUND"
  | "NODE_OBSCURED_BY_KEYBOARD"
  | "TIMEOUT_WAITING_RENDER"
  | "UNEXPECTED_SCREEN"
  | "CLICK_REJECTED";

export interface DiagnosticResult {
  failureReason: FailureReason;
  diagnosticMessage: string;
  diagnosticMessage_bn: string;
  attemptNumber: number;
  recoveryTactic: string;
}

export interface UserRecoveryPrompt {
  isOpen: boolean;
  failedStepTitle: string;
  failedStepTitleBn?: string;
  errorReason: string;
  errorReasonBn?: string;
  stepIndex: number;
}

export interface AndroidCodeFile {
  id: string;
  path: string;
  filename: string;
  category: "Manifest" | "Service" | "AI Engine" | "Execution" | "UI" | "Test" | "Config" | "Architecture";
  description: string;
  code: string;
}
