import { useState } from "react";

interface AddCueFormProps {
  onAdd: (input: { name: string; scene: string }) => void;
}

export function AddCueForm({ onAdd }: AddCueFormProps) {
  const [name, setName] = useState("");
  const [scene, setScene] = useState("");

  const submit = () => {
    if (!name.trim() && !scene.trim()) return;
    onAdd({ name, scene });
    setName("");
    setScene("");
  };

  return (
    <section className="panel add-cue">
      <div className="heading">
        <div>
          <p>Cue 表</p>
          <h2>新增一个 Cue</h2>
        </div>
      </div>
      <div className="add-cue__form">
        <input
          placeholder="Cue 编号，如 Cue 31"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <input
          placeholder="场景说明（可选）"
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="primary" onClick={submit}>
          加入 Cue 表
        </button>
      </div>
    </section>
  );
}
