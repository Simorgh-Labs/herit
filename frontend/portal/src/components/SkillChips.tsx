interface SkillChipsProps {
  skills: string;
}

export default function SkillChips({ skills }: SkillChipsProps) {
  const chips = skills.split(',').map((s) => s.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((skill) => (
        <span
          key={skill}
          className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
