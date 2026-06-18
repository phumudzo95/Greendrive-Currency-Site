import { APPLICATION_STEPS } from "@/lib/application-schema";

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-9 flex items-center">
      {APPLICATION_STEPS.map((label, i) => {
        const isComplete = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold transition-colors ${
                  isComplete
                    ? "bg-gd-primary text-white"
                    : isActive
                    ? "border-2 border-gd-primary text-gd-primary"
                    : "border-2 border-gd-line text-gd-mute"
                }`}
              >
                {isComplete ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1.5 hidden text-[11px] font-medium sm:block ${
                  isActive ? "text-gd-primary" : "text-gd-mute"
                }`}
              >
                {label}
              </span>
            </div>
            {i < APPLICATION_STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                  isComplete ? "bg-gd-primary" : "bg-gd-line"
                }`}
                style={{ marginBottom: "20px" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
