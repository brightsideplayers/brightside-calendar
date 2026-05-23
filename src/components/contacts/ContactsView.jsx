import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import {
  useMemo,
  useState
} from "react";

import GlassCard from "../layout/GlassCard";

export default function ContactsView({
  contacts = []
}) {
  const [selectedRole, setSelectedRole] =
    useState("All");

  const [excludedRole, setExcludedRole] =
    useState("");

  const [selectedContact, setSelectedContact] =
    useState(null);

  const [editingContact, setEditingContact] =
    useState(false);

  const [name, setName] =
    useState("");

  const [roles, setRoles] =
    useState([]);

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [showAddModal, setShowAddModal] =
  useState(false);

  const roleOptions = [
    "All",
    "Executive",
    "Cast",
    "Crew",
    "Marketing",
    "Volunteer",
    "Director",
    "Music",
    "Costumes",
    "Props",
    "Set Design",
    "Current Member",
    "Past Member"
  ];

  const filteredContacts =
    useMemo(() => {
      return contacts
        .filter((contact) => {
          const contactRoles =
            contact.roles ||
            (contact.role
              ? [contact.role]
              : []);

          const matchesIncluded =
            selectedRole ===
            "All"
              ? true
              : contactRoles.includes(
                  selectedRole
                );

          const matchesExcluded =
            excludedRole
              ? !contactRoles.includes(
                  excludedRole
                )
              : true;

          return (
            matchesIncluded &&
            matchesExcluded
          );
        })
        .sort((a, b) =>
          (a.name || "").localeCompare(
            b.name || ""
          )
        );
    }, [
      contacts,
      selectedRole,
      excludedRole
    ]);

  const groupedContacts =
    filteredContacts.reduce(
      (acc, contact) => {
        const firstLetter =
          contact.name?.[0]?.toUpperCase() ||
          "#";

        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }

        acc[firstLetter].push(
          contact
        );

        return acc;
      },
      {}
    );

  const openContact = (
    contact
  ) => {
    setSelectedContact(contact);

    setEditingContact(false);

    setName(contact.name || "");

    setRoles(
      contact.roles ||
        (contact.role
          ? [contact.role]
          : [])
    );

    setPhone(contact.phone || "");

    setEmail(contact.email || "");

    setNotes(contact.notes || "");
  };

  const saveContact =
    async () => {
      if (!selectedContact)
        return;

      await updateDoc(
        doc(
          db,
          "contacts",
          selectedContact.id
        ),
        {
          name,
          roles,
          phone,
          email,
          notes
        }
      );

      setSelectedContact({
        ...selectedContact,
        name,
        roles,
        phone,
        email,
        notes
      });

      setEditingContact(false);
    };

  const addNewContact =
    async () => {
      if (!name.trim()) return;

      await addDoc(
        collection(db, "contacts"),
        {
          name,
          roles,
          phone,
          email,
          notes,
          createdAt: Date.now()
        }
      );

      setName("");
      setRoles([]);
      setPhone("");
      setEmail("");
      setNotes("");
    };

  const copyEmails =
    async () => {
      const emails =
        filteredContacts
          .map((c) => c.email)
          .filter(Boolean)
          .join(", ");

      await navigator.clipboard.writeText(
        emails
      );
    };

  return (
    <>
      <div className="grid gap-5">
        {showAddModal && (
        <GlassCard>
          <div className="grid gap-5">
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                Contacts
              </h2>

              <div className="text-cyan-100/60 mt-2">
                Production directory
              </div>
            </div>

            <div className="grid gap-3">
              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Name"
                className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
              />

              <div className="rounded-[1.6rem] border border-white/10 bg-black/30 p-4 grid gap-3">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/50">
                  Roles
                </div>

                <select
                  onChange={(e) => {
                    const selected =
                      e.target.value;

                    if (
                      selected &&
                      !roles.includes(
                        selected
                      )
                    ) {
                      setRoles([
                        ...roles,
                        selected
                      ]);
                    }
                  }}
                  className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                >
                  <option value="">
                    Add Role
                  </option>

                  {roleOptions
                    .filter(
                      (r) =>
                        r !== "All"
                    )
                    .map((r) => (
                      <option
                        key={r}
                        value={r}
                      >
                        {r}
                      </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <div
                      key={r}
                      className="h-10 px-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/20 text-white flex items-center gap-2"
                    >
                      <span>{r}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setRoles(
                            roles.filter(
                              (
                                x
                              ) =>
                                x !== r
                            )
                          )
                        }
                        className="text-cyan-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Phone"
                className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
              />

              <input
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Email"
                className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
              />

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Notes"
                className="min-h-[120px] rounded-[1.8rem] bg-black/30 border border-white/10 p-5"
              />

              <button
                onClick={
                  addNewContact
                }
                className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 font-bold"
              >
                Add Contact
              </button>
            </div>
          </div>
        </GlassCard>
      )}

        <GlassCard>
          <div className="grid gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-sm uppercase tracking-[0.25em] text-cyan-200/50">
                  Directory
                </div>

                <button
                  onClick={
                    copyEmails
                  }
                  className="h-10 px-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 text-sm"
                >
                  Copy Emails
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                >
                  {roleOptions.map(
                    (role) => (
                      <option
                        key={role}
                      >
                        {role}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={excludedRole}
                  onChange={(e) =>
                    setExcludedRole(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                >
                  <option value="">
                    Exclude Role
                  </option>

                  {roleOptions
                    .filter(
                      (r) =>
                        r !== "All"
                    )
                    .map((role) => (
                      <option
                        key={role}
                      >
                        {role}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6">
              {Object.keys(
                groupedContacts
              ).map((letter) => (
                <div
                  key={letter}
                  className="grid gap-2"
                >
                  <div className="text-cyan-300/50 text-xs uppercase tracking-[0.3em] px-2">
                    {letter}
                  </div>

                  <div className="grid gap-2">
                    {groupedContacts[
                      letter
                    ].map(
                      (contact) => (
                        <button
                          key={
                            contact.id
                          }
                          onClick={() =>
                            openContact(
                              contact
                            )
                          }
                          className="rounded-[1.6rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-4 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-lg font-black shrink-0">
                              {contact.name?.[0]}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">
                                {
                                  contact.name
                                }
                              </div>

                              <div className="text-sm text-cyan-100/50 truncate">
                                {(
                                  contact.roles ||
                                  (contact.role
                                    ? [
                                        contact.role
                                      ]
                                    : [])
                                ).join(
                                  ", "
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-cyan-100/30 text-xl">
                            ›
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}

              {filteredContacts.length ===
                0 && (
                <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                  No contacts found.
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {selectedContact && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#071018] p-6 grid gap-5 relative shadow-[0_0_60px_rgba(0,255,255,0.08)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedContact(
                  null
                );

                setEditingContact(
                  false
                );
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cyan-400 text-black font-black text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-3xl font-black shrink-0">
                {
                  selectedContact.name?.[0]
                }
              </div>

              <div className="min-w-0">
                <div className="text-4xl font-black text-white break-words">
                  {selectedContact.name}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {(selectedContact.roles ||
                    []).map(
                    (r) => (
                      <div
                        key={r}
                        className="px-3 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/20 text-xs uppercase tracking-[0.2em]"
                      >
                        {r}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 grid gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/40 mb-2">
                  Phone
                </div>

                <div className="text-xl text-white">
                  {
                    selectedContact.phone
                  }
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/40 mb-2">
                  Email
                </div>

                <div className="text-xl text-white break-all">
                  {
                    selectedContact.email
                  }
                </div>
              </div>

              {selectedContact.notes && (
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/40 mb-2">
                    Notes
                  </div>

                  <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                    {
                      selectedContact.notes
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setEditingContact(
                    true
                  )
                }
                className="h-12 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold"
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await deleteDoc(
                    doc(
                      db,
                      "contacts",
                      selectedContact.id
                    )
                  );

                  setSelectedContact(
                    null
                  );
                }}
                className="h-12 rounded-2xl border border-red-300/20 bg-red-500/10 text-red-100 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <button
  onClick={() =>
  setShowAddModal(
    !showAddModal
  )
}
  className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-4xl text-white shadow-[0_0_40px_rgba(217,70,239,0.45)] flex items-center justify-center hover:scale-110 transition-all"
>
  +
</button>
    </>
  );
}
