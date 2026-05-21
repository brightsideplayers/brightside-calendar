
import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function ContactsView() {
  const [selectedSkill, setSelectedSkill] = useState("All");

  const contacts = [
    {
      id: 1,
      name: "Morna",
      skill: "Executive",
      email: "morna@example.com"
    }
  ];

  const copyEmails = (skill) => {
    const emails = contacts
      .filter((c) => skill === "All" || c.skill === skill)
      .map((c) => c.email)
      .join(", ");

    navigator.clipboard.writeText(emails);
  };

  return (
    <div className="grid gap-5">
      <div className="flex gap-2 flex-wrap">
        {["All", "Executive", "Actors"].map((skill) => (
          <button
            key={skill}
            onClick={() => {
              setSelectedSkill(skill);
              copyEmails(skill);
            }}
            className="h-11 px-4 rounded-2xl border border-white/10"
          >
            {skill}
          </button>
        ))}
      </div>

      {contacts
        .filter((c) =>
          selectedSkill === "All"
            ? true
            : c.skill === selectedSkill
        )
        .map((contact) => (
          <GlassCard key={contact.id}>
            <div>{contact.name}</div>
            <div>{contact.email}</div>
          </GlassCard>
        ))}
    </div>
  );
}
