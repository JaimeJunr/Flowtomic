// API e comportamento inspirados no Questionnaire/QuestionCard do shadcn-ui/chatbot-template
// (MIT) — ver packages/ui/THIRD_PARTY_NOTICES.md. Reescrito sobre Radix RadioGroup, sem
// @shadcn/react.
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/actions/button";
import { Shimmer } from "@/components/atoms/animation/shimmer";
import { cn } from "@/lib/utils";

export interface QuestionnaireChoice {
  value: string;
  label: string;
}

export interface QuestionnaireQuestion {
  id: string;
  title: string;
  choices: QuestionnaireChoice[];
}

export interface QuestionnaireAnswer {
  questionId: string;
  question: string;
  /** Rótulo da opção escolhida ou o texto livre; vazio quando pulada. */
  answer: string;
  skipped: boolean;
}

export interface QuestionnaireProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  questions: QuestionnaireQuestion[];
  onSubmit: (answers: QuestionnaireAnswer[]) => void;
  /** O assistente ainda está montando a pergunta. */
  preparing?: boolean;
}

interface Draft {
  choice?: string;
  other: string;
}

const EMPTY_DRAFT: Draft = { other: "" };
const MISSING_ANSWER = "Escolha uma opção ou escreva a sua resposta.";

function resolveAnswer(question: QuestionnaireQuestion, draft: Draft): string {
  const chosen = question.choices.find((c) => c.value === draft.choice);
  return chosen ? chosen.label : draft.other.trim();
}

function useQuestionnaireSteps(
  questions: QuestionnaireQuestion[],
  onSubmit: QuestionnaireProps["onSubmit"]
) {
  const [index, setIndex] = React.useState(0);
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [answers, setAnswers] = React.useState<QuestionnaireAnswer[]>([]);
  const [error, setError] = React.useState(false);
  const current = questions[index];
  const isLast = index === questions.length - 1;

  const commit = (answer: string, skipped: boolean) => {
    const all = [...answers, { questionId: current.id, question: current.title, answer, skipped }];
    if (isLast) return onSubmit(all);
    setAnswers(all);
    setDraft(EMPTY_DRAFT);
    setError(false);
    setIndex(index + 1);
  };

  const next = () => {
    const answer = resolveAnswer(current, draft);
    if (!answer) return setError(true);
    commit(answer, false);
  };

  const update = (patch: Draft) => {
    setDraft(patch);
    setError(false);
  };

  return { index, current, isLast, draft, error, next, skip: () => commit("", true), update };
}

function QuestionnaireProgress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-muted-foreground">
        Pergunta {index + 1} de {total}
      </span>
      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: segmentos fixos, só posição
            key={i}
            className={cn("h-1 w-5 rounded-full", i <= index ? "bg-primary" : "bg-border")}
          />
        ))}
      </span>
    </div>
  );
}

const KEY_CLASS =
  "inline-flex size-[22px] shrink-0 items-center justify-center rounded-md border border-input font-mono text-xs text-muted-foreground";

function QuestionnaireOption({
  choice,
  position,
}: {
  choice: QuestionnaireChoice;
  position: number;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={choice.value}
      className={cn(
        "group flex min-h-11 w-full items-center gap-3 rounded-[10px] border border-border px-3 py-2 text-left text-[15px] outline-none transition-colors",
        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/10"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          KEY_CLASS,
          "group-data-[state=checked]:border-primary group-data-[state=checked]:text-primary"
        )}
      >
        {position}
      </span>
      <span className="flex-1">{choice.label}</span>
      <RadioGroupPrimitive.Indicator>
        <Check aria-hidden="true" className="size-4 text-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

function QuestionnaireFrame({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="questionnaire"
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  );
}

function Questionnaire({
  questions,
  onSubmit,
  preparing = false,
  className,
  ...props
}: QuestionnaireProps) {
  const steps = useQuestionnaireSteps(questions, onSubmit);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const otherRef = React.useRef<HTMLInputElement>(null);
  const firstRender = React.useRef(true);
  const ids = React.useId();

  // biome-ignore lint/correctness/useExhaustiveDependencies: o foco acompanha a troca de pergunta
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [steps.index]);

  if (preparing || !steps.current) {
    return (
      <QuestionnaireFrame className={className} {...props}>
        <Shimmer as="span" className="text-sm">
          Preparando a pergunta…
        </Shimmer>
      </QuestionnaireFrame>
    );
  }

  const { current, draft } = steps;
  const otherPosition = current.choices.length + 1;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "text") return;
    const position = Number(event.key);
    if (!Number.isInteger(position) || position < 1) return;
    const choice = current.choices[position - 1];
    if (choice) {
      steps.update({ choice: choice.value, other: "" });
      event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[position - 1]?.focus();
      return;
    }
    if (position === otherPosition) {
      event.preventDefault();
      otherRef.current?.focus();
    }
  };

  return (
    <QuestionnaireFrame className={className} {...props}>
      {questions.length > 1 ? (
        <QuestionnaireProgress index={steps.index} total={questions.length} />
      ) : null}
      <form
        className="flex flex-col gap-4"
        onKeyDown={handleKeyDown}
        onSubmit={(event) => {
          event.preventDefault();
          steps.next();
        }}
      >
        <h3
          ref={headingRef}
          id={`${ids}-title`}
          tabIndex={-1}
          className="font-display text-lg font-semibold outline-none"
        >
          {current.title}
        </h3>
        <div className="flex flex-col gap-2">
          <RadioGroupPrimitive.Root
            aria-labelledby={`${ids}-title`}
            aria-invalid={steps.error || undefined}
            aria-describedby={steps.error ? `${ids}-error` : undefined}
            value={draft.choice ?? ""}
            onValueChange={(choice) => steps.update({ choice, other: "" })}
            className="flex flex-col gap-2"
          >
            {current.choices.map((choice, i) => (
              <QuestionnaireOption key={choice.value} choice={choice} position={i + 1} />
            ))}
          </RadioGroupPrimitive.Root>
          <label className="flex min-h-11 items-center gap-3 rounded-[10px] border border-border px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            <span aria-hidden="true" className={KEY_CLASS}>
              {otherPosition}
            </span>
            <span className="sr-only">Outra resposta</span>
            <input
              ref={otherRef}
              type="text"
              value={draft.other}
              placeholder="Outra resposta"
              onChange={(event) => steps.update({ other: event.target.value })}
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>
        {steps.error ? (
          <p id={`${ids}-error`} role="alert" className="text-sm text-destructive">
            {MISSING_ANSWER}
          </p>
        ) : null}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={steps.skip}
          >
            Pular
          </Button>
          <Button type="submit">
            {steps.isLast ? "Enviar" : "Próxima"}
            {steps.isLast ? null : <ChevronRight aria-hidden="true" />}
          </Button>
        </div>
      </form>
    </QuestionnaireFrame>
  );
}

Questionnaire.displayName = "Questionnaire";

export interface QuestionnaireSummaryProps extends React.ComponentProps<"ol"> {
  answers: QuestionnaireAnswer[];
}

/** O que fica no histórico depois que a pessoa respondeu. */
function QuestionnaireSummary({ answers, className, ...props }: QuestionnaireSummaryProps) {
  return (
    <ol
      data-slot="questionnaire-summary"
      className={cn("flex list-decimal flex-col gap-1.5 pl-5 text-[15px]", className)}
      {...props}
    >
      {answers.map((item) => (
        <li key={item.questionId}>
          <span className="text-muted-foreground">{item.question}</span>{" "}
          {item.skipped ? <span className="text-muted-foreground italic">Pulou</span> : item.answer}
        </li>
      ))}
    </ol>
  );
}

QuestionnaireSummary.displayName = "QuestionnaireSummary";

export { Questionnaire, QuestionnaireSummary };
