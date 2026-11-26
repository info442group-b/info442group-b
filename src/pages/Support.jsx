import React, { useState } from "react";

const resources = [{name: "988 Lifeline",
    type: "24/7",
    info: "Call or text anytime, free and private.",
    link: "tel:988",
    cta: "Call or text 988"},
  {name: "Crisis Text Line",
    type: "24/7",
    info: "Don't feel like talking? Text with someone who is ready to listen.",
    link: "sms:741741?body=HOME",
    cta: "Text HOME to 741741"},
  {name: "UW Husky HelpLine",
    type: "campus",
    info: "School stress or just a rough week? Here is a free and private support for UW students.",
    link: "tel:2065431240",
    cta: "Call 206-543-1240"}];

export default function Support() {const [searchText, setSearchText] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");

  const filtered = [];
  for (const item of resources) {const matchesType = currentFilter === "all" || item.type === currentFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.info.toLowerCase().includes(searchText.toLowerCase());

    if (matchesType && matchesSearch) {filtered.push(item);}}

  return (<div className="support-container">
      <h1>Someone is with you, ask for support!</h1>
      <p>You don't have to carry everything alone. Free and private support is right here.</p>

      <input
        id="searchBox"
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="What do you need right now? (e.g., text, 988, UW)..."/>

      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={() => setCurrentFilter("all")}>Everything</button>
        <button onClick={() => setCurrentFilter("24/7")}>Text Now</button>
        <button onClick={() => setCurrentFilter("campus")}>On Campus</button>
      </div>

      <div id="results">
        {filtered.map((item) => (
          <div className="card" key={item.name}>
            <h3>{item.name}</h3>
            <p>{item.info}</p>
            <a href={item.link}>{item.cta} →</a>
          </div>))}

        {filtered.length === 0 && (
          <p>Nothing came up for that, try another word or tap Everything.</p>)}
      </div>
    </div>);}
