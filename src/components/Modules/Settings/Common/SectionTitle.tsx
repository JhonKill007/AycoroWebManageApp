export const SectionTitle = ({
  title,
  sub,
  c,
}: {
  title: string;
  sub?: string;
  c: any;
}) => {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: c.textMuted, marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  );
};
