export default function DiffView({
  diff,
  className = "",
}: {
  diff: string;
  className?: string;
}) {
  const lines = diff.replace(/\r\n/g, "\n").split("\n");
  return (
    <pre
      className={`overflow-auto rounded-md border border-line bg-paper font-mono text-[12.5px] leading-6 ${className}`}
      tabIndex={0}
      aria-label="Code diff"
    >
      <code className="block min-w-max py-2">
        {lines.map((line, i) => {
          const add = line.startsWith("+") && !line.startsWith("+++");
          const del = line.startsWith("-") && !line.startsWith("---");
          const hunk = line.startsWith("@@");
          const tone = add
            ? "border-ok bg-ok-soft"
            : del
              ? "border-high bg-high-soft"
              : hunk
                ? "border-transparent bg-accent-soft text-accent"
                : "border-transparent text-muted";
          return (
            <span
              key={i}
              className={`block whitespace-pre border-l-2 px-3 ${tone}`}
            >
              {line || " "}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
