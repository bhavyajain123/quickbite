
import React, { useState } from "react";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search food, dishes or restaurants...",
}) {
  const [internalValue, setInternalValue] = useState("");

  const searchValue =
    value !== undefined ? value : internalValue;

  function handleChange(event) {
    const newValue = event.target.value;

    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (onSearch) {
      onSearch(searchValue.trim());
    }
  }

  function clearSearch() {
    if (onChange) {
      onChange("");
    } else {
      setInternalValue("");
    }

    if (onSearch) {
      onSearch("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 8px 7px 15px",
        background: "#ffffff",
        border: "1px solid #eee2d9",
        borderRadius: 14,
        boxShadow: "0 6px 22px #00000008",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 21,
          color: "#ff6b35",
        }}
      >
        ⌕
      </span>

      <input
        type="search"
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search food and restaurants"
        style={{
          flex: 1,
          width: 0,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          padding: "12px 0",
          color: "#332a25",
          fontSize: 14,
        }}
      />

      {searchValue && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
          style={{
            border: "none",
            background: "transparent",
            color: "#888",
            fontSize: 19,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      )}

      <button
        type="submit"
        style={{
          border: "none",
          borderRadius: 10,
          padding: "12px 18px",
          background: "#ff6b35",
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Search
      </button>
    </form>
  );
}
