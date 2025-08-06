import { cn } from "@/lib/utils";
import { useState } from "react";

export default function InputAbsen({ type, name, label, placeholder, value, required, readonly, note, minLength, onChange, options }) {
  const [error, setError] = useState("");

  const validateLength = (e) => {
    const currentValue = e.target.value;
    if (minLength && currentValue.length < minLength) {
      setError(`Minimal ${minLength} karakter diperlukan`);
    } else {
      setError("");
    }

    // Panggil onChange dari parent jika ada
    if (onChange) {
      onChange(e);
    }
  };

  if (type === "textarea") {
    return (
      <div className="relative w-full mb-5">
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-800">
          {label || "Input Label"}
        </label>
        <textarea
          id={name}
          name={name}
          rows="4"
          value={value}
          placeholder={placeholder}
          required={required}
          readOnly={readonly}
          onBlur={validateLength}
          onChange={validateLength}
          minLength={minLength}
          className={cn("block w-full p-3 text-gray-900 border border-gray-200 rounded-lg bg-white text-base", "focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-opacity-50", "transition-all duration-200 ease-in-out shadow-sm resize-vertical", readonly && "bg-gray-50 cursor-not-allowed opacity-75", error && "border-red-500 focus:ring-red-500 focus:border-red-500")}></textarea>
        <div className="flex justify-between mt-1">
          <p className={error ? "text-red-500 text-sm" : "hidden"}>{error}</p>
          <p className="ms-auto text-sm text-gray-700">{note}</p>
        </div>
      </div>
    );
  } else if (type === "select") {
    return (
      <>
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-900">
          {label}
        </label>
        <select
          id={name}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
          <option defaultValue>{placeholder || "Pilih salah satu opsi"}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {/* <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="FR">France</option>
          <option value="DE">Germany</option> */}
        </select>
      </>
    );
  } else {
    return (
      <div className="relative w-full mb-5">
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-800">
          {label || "Input Label"}
        </label>
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          placeholder={placeholder}
          required={required}
          readOnly={readonly}
          onBlur={validateLength}
          onChange={validateLength}
          minLength={minLength}
          className={cn("block w-full p-3 text-gray-900 border border-gray-200 rounded-lg bg-white text-base", "focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-opacity-50", "transition-all duration-200 ease-in-out shadow-sm", readonly && "bg-gray-50 cursor-not-allowed opacity-75", error && "border-red-500 focus:ring-red-500 focus:border-red-500")}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
}
