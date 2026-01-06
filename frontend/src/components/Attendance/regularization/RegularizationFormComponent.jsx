// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function RegularizationFormComponent() {
//   const navigate = useNavigate();
//   const today = new Date().toISOString().split("T")[0];

//   const emptyRow = {
//     date: today,
//     regularizationType: "",
//     correctedCheckIn: "",
//     correctedCheckOut: "",
//     reason: "",
//   };

//   const [rows, setRows] = useState([emptyRow]);
//   const TOAST_ID = "regularization-toast";
//   const rowRefs = useRef([]);

//   const handleChange = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;

//     if (field === "regularizationType") {
//       if (value === "forgot to checkin") {
//         updatedRows[index].correctedCheckOut = "";
//       } else if (value === "forgot to checkout") {
//         updatedRows[index].correctedCheckIn = "";
//       }
//     }

//     setRows(updatedRows);
//   };

//   const addRow = () => setRows([...rows, { ...emptyRow }]);
//   const removeRow = (index) =>
//     rows.length > 1 && setRows(rows.filter((_, i) => i !== index));

//   useEffect(() => {
//     if (rowRefs.current.length > 0) {
//       const lastRow = rowRefs.current[rowRefs.current.length - 1];
//       lastRow?.scrollIntoView({ behavior: "smooth", block: "end" });
//     }
//   }, [rows]);

//   const validateRows = () => {
//     for (let i = 0; i < rows.length; i++) {
//       const r = rows[i];
//       if (!r.date)
//         return toast.error(`Row ${i + 1}: Date is required`, {
//           toastId: TOAST_ID,
//         });
//       if (!r.regularizationType)
//         return toast.error(`Row ${i + 1}: Type is required`, {
//           toastId: TOAST_ID,
//         });
//       if (r.regularizationType !== "forgot to checkout" && !r.correctedCheckIn)
//         return toast.error(`Row ${i + 1}: Check-in is required`, {
//           toastId: TOAST_ID,
//         });
//       if (r.regularizationType !== "forgot to checkin" && !r.correctedCheckOut)
//         return toast.error(`Row ${i + 1}: Check-out is required`, {
//           toastId: TOAST_ID,
//         });
//       if (!r.reason)
//         return toast.error(`Row ${i + 1}: Reason is required`, {
//           toastId: TOAST_ID,
//         });
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateRows()) return;

//     const payload = rows.map((r) => ({
//       employee_id: 1,
//       date: r.date,
//       regularization_type: r.regularizationType,
//       corrected_check_in:
//         r.regularizationType !== "forgot to checkout"
//           ? r.correctedCheckIn || null
//           : null,
//       corrected_check_out:
//         r.regularizationType !== "forgot to checkin"
//           ? r.correctedCheckOut || null
//           : null,
//       reason: r.reason,
//     }));

//     try {
//       const res = await fetch(
//         "http://localhost:8000/api/regularization/apply/multiple",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ requests: payload }),
//         }
//       );
//       const data = await res.json();

//       if (!res.ok)
//         return toast.error("Backend Error: " + data.detail, {
//           toastId: TOAST_ID,
//         });

//       toast.success("Regularization requests submitted!", {
//         toastId: TOAST_ID,
//       });
//       setRows([emptyRow]);
//     } catch {
//       toast.error("Backend unreachable!", { toastId: TOAST_ID });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-xl overflow-auto max-h-[80vh]">
//         <h2 className="text-2xl font-bold mb-8 text-center text-blue-800  ">
//           Regularization Request{" "}
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {rows.map((row, index) => (
//             <div
//               key={index}
//               ref={(el) => (rowRefs.current[index] = el)}
//               className="flex flex-wrap gap-4 items-end p-4 border border-gray-300 rounded-lg"
//             >
//               <div className="flex flex-col">
//                 <label className="font-bold text-sm text-gray-700">
//                   Date <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={row.date}
//                   onChange={(e) => handleChange(index, "date", e.target.value)}
//                   className="border border-gray-300 p-2 rounded w-36 focus:ring-1 focus:ring-gray-400"
//                   required
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label className="font-bold text-sm text-gray-700">
//                   Type <span className="text-red-600">*</span>
//                 </label>
//                 <select
//                   value={row.regularizationType}
//                   onChange={(e) =>
//                     handleChange(index, "regularizationType", e.target.value)
//                   }
//                   className="border border-gray-300 p-2 rounded w-44 focus:ring-1 focus:ring-gray-400"
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option value="forgot to checkin">Forgot to check‑in</option>
//                   <option value="forgot to checkout">
//                     Forgot to check‑out 
//                   </option>
//                   <option value="Work From Home">Work From Home</option>
//                 </select>
//               </div>

//               {row.regularizationType !== "forgot to checkout" && (
//                 <div className="flex flex-col">
//                   <label className="font-bold text-sm text-gray-700">
//                     Check‑in <span className="text-red-600">*</span>
//                   </label>
//                   <input
//                     type="time"
//                     value={row.correctedCheckIn}
//                     onChange={(e) =>
//                       handleChange(index, "correctedCheckIn", e.target.value)
//                     }
//                     className="border border-gray-300 p-2 rounded w-32 focus:ring-1 focus:ring-gray-400"
//                     required
//                   />
//                 </div>
//               )}

//               {row.regularizationType !== "forgot to checkin" && (
//                 <div className="flex flex-col">
//                   <label className="font-bold text-sm text-gray-700">
//                     Check‑out <span className="text-red-600">*</span>
//                   </label>
//                   <input
//                     type="time"
//                     value={row.correctedCheckOut}
//                     onChange={(e) =>
//                       handleChange(index, "correctedCheckOut", e.target.value)
//                     }
//                     className="border border-gray-300 p-2 rounded w-32 focus:ring-1 focus:ring-gray-400"
//                     required
//                   />
//                 </div>
//               )}

//               <div className="flex flex-col flex-1 min-w-[200px]">
//                 <label className="font-bold text-sm text-gray-700">
//                   Reason <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={row.reason}
//                   onChange={(e) =>
//                     handleChange(index, "reason", e.target.value)
//                   }
//                   placeholder="Enter reason"
//                   className="border border-gray-300 p-2 rounded w-full focus:ring-1 focus:ring-gray-400"
//                   required
//                 />
//               </div>

//               {rows.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeRow(index)}
//                   className="text-red-500 text-lg font-bold hover:text-red-700"
//                   title="Remove"
//                 >
//                   ✕
//                 </button>
//               )}
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addRow}
//             className="flex items-center gap-2 text-blue-700 font-bold"
//           >
//             <span className="text-2xl">+</span> Add More
//           </button>
//           <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={() => navigate("/attendance/regularization")}
//               className="px-6 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 w-full sm:w-auto"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 w-full sm:w-auto"
//             >
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useRef, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import * as formClasses from "../../../formClasses";

// export default function RegularizationFormComponent({ isOpen, onClose }) {
//   const today = new Date().toISOString().split("T")[0];

//   const emptyRow = {
//     date: today,
//     regularizationType: "",
//     correctedCheckIn: "",
//     correctedCheckOut: "",
//     reason: "",
//   };

//   const [rows, setRows] = useState([emptyRow]);
//   const TOAST_ID = "regularization-toast";
//   const rowRefs = useRef([]);

//   const handleChange = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;

//     if (field === "regularizationType") {
//       if (value === "forgot to checkin") updatedRows[index].correctedCheckOut = "";
//       else if (value === "forgot to checkout") updatedRows[index].correctedCheckIn = "";
//     }

//     setRows(updatedRows);
//   };

//   const addRow = () => setRows([...rows, { ...emptyRow }]);
//   const removeRow = (index) => rows.length > 1 && setRows(rows.filter((_, i) => i !== index));

//   useEffect(() => {
//     if (rowRefs.current.length > 0) {
//       const lastRow = rowRefs.current[rowRefs.current.length - 1];
//       lastRow?.scrollIntoView({ behavior: "smooth", block: "end" });
//     }
//   }, [rows]);

//   const validateRows = () => {
//     for (let i = 0; i < rows.length; i++) {
//       const r = rows[i];
//       if (!r.date)
//         return toast.error(`Row ${i + 1}: Date is required`, { toastId: TOAST_ID });
//       if (!r.regularizationType)
//         return toast.error(`Row ${i + 1}: Type is required`, { toastId: TOAST_ID });
//       if (r.regularizationType !== "forgot to checkout" && !r.correctedCheckIn)
//         return toast.error(`Row ${i + 1}: Check-in is required`, { toastId: TOAST_ID });
//       if (r.regularizationType !== "forgot to checkin" && !r.correctedCheckOut)
//         return toast.error(`Row ${i + 1}: Check-out is required`, { toastId: TOAST_ID });
//       if (!r.reason)
//         return toast.error(`Row ${i + 1}: Reason is required`, { toastId: TOAST_ID });
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateRows()) return;

//     const payload = rows.map((r) => ({
//       employee_id: 1,
//       date: r.date,
//       regularization_type: r.regularizationType,
//       corrected_check_in: r.regularizationType !== "forgot to checkout" ? r.correctedCheckIn || null : null,
//       corrected_check_out: r.regularizationType !== "forgot to checkin" ? r.correctedCheckOut || null : null,
//       reason: r.reason,
//     }));

//     try {
//       const res = await fetch(
//         "http://localhost:8000/api/regularization/apply/multiple",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ requests: payload }),
//         }
//       );
//       const data = await res.json();

//       if (!res.ok)
//         return toast.error("Backend Error: " + data.detail, { toastId: TOAST_ID });

//       toast.success("Regularization requests submitted!", { toastId: TOAST_ID });
//       setRows([emptyRow]);
//       onClose();
//     } catch {
//       toast.error("Backend unreachable!", { toastId: TOAST_ID });
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className={formClasses.overlay} onClick={onClose} />
//       <div className={formClasses.drawer}>
//         <div className={formClasses.header}>
//           <div>
//             <h2 className={formClasses.headerTitle}>Regularization Request</h2>
//             {/* <p className={formClasses.headerSubTitle}>Fill the details below</p> */}
//           </div>
//           <button className={formClasses.closeButton} onClick={onClose}>✕</button>
//         </div>

//         <form onSubmit={handleSubmit} className={formClasses.body}>
//           {rows.map((row, index) => (
//             <div
//               key={index}
//               ref={(el) => (rowRefs.current[index] = el)}
//               className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg mb-4"
//             >
//               {/* Row 1: Date & Type */}
//               <div className="flex flex-col md:flex-row gap-4">
//                 <div className="flex-1 flex flex-col">
//                   <label className={formClasses.fieldLabel}>Date <span className="text-red-600">*</span></label>
//                   <input
//                     type="date"
//                     value={row.date}
//                     onChange={(e) => handleChange(index, "date", e.target.value)}
//                     className={formClasses.inputClass + " w-full"}
//                     required
//                   />
//                 </div>
//                 <div className="flex-1 flex flex-col">
//                   <label className={formClasses.fieldLabel}>Type <span className="text-red-600">*</span></label>
//                   <select
//                     value={row.regularizationType}
//                     onChange={(e) => handleChange(index, "regularizationType", e.target.value)}
//                     className={formClasses.selectClass + " w-full"}
//                     required
//                   >
//                     <option value="">Select</option>
//                     <option value="forgot to checkin">Forgot to check‑in</option>
//                     <option value="forgot to checkout">Forgot to check‑out</option>
//                     <option value="Work From Home">Work From Home</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Row 2: Check-in & Check-out */}
//               <div className="flex flex-col md:flex-row gap-4">
//                 {row.regularizationType !== "forgot to checkout" && (
//                   <div className="flex-1 flex flex-col">
//                     <label className={formClasses.fieldLabel}>Check-in <span className="text-red-600">*</span></label>
//                     <input
//                       type="time"
//                       value={row.correctedCheckIn}
//                       onChange={(e) => handleChange(index, "correctedCheckIn", e.target.value)}
//                       className={formClasses.inputClass + " w-full"}
//                     />
//                   </div>
//                 )}
//                 {row.regularizationType !== "forgot to checkin" && (
//                   <div className="flex-1 flex flex-col">
//                     <label className={formClasses.fieldLabel}>Check-out <span className="text-red-600">*</span></label>
//                     <input
//                       type="time"
//                       value={row.correctedCheckOut}
//                       onChange={(e) => handleChange(index, "correctedCheckOut", e.target.value)}
//                       className={formClasses.inputClass + " w-full"}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Row 3: Reason */}
//               <div className="flex flex-col">
//                 <label className={formClasses.fieldLabel}>Reason <span className="text-red-600">*</span></label>
//                 <input
//                   type="text"
//                   value={row.reason}
//                   onChange={(e) => handleChange(index, "reason", e.target.value)}
//                   placeholder="Enter reason"
//                   className={formClasses.inputClass + " w-full"}
//                 />
//               </div>

//               {rows.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeRow(index)}
//                   className="text-red-500 text-lg font-bold hover:text-red-700 self-start"
//                 >
//                   ✕ Remove Row
//                 </button>
//               )}
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addRow}
//             className="flex items-center gap-2 text-blue-700 font-bold mb-4"
//           >
//             <span className="text-2xl">+</span> Add More
//           </button>

//           <div className={formClasses.footer}>
//             <button type="button" onClick={onClose} className={formClasses.buttonSecondary}>
//               Cancel
//             </button>
//             <button type="submit" className={formClasses.buttonPrimary}>
//               Submit
//             </button>
//           </div>
//         </form>

//         <ToastContainer position="top-right" autoClose={3000} />
//       </div>
//     </>
//   );
// }



import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as formClasses from "../../../formClasses";

export default function RegularizationFormComponent({ isOpen, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const emptyRow = {
    date: today,
    regularizationType: "",
    correctedCheckIn: "",
    correctedCheckOut: "",
    reason: "",
  };

  const [rows, setRows] = useState([emptyRow]);
  const rowRefs = useRef([]);
  const TOAST_ID = "regularization-toast";

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "regularizationType") {
      if (value === "forgot to checkin") updatedRows[index].correctedCheckOut = "";
      if (value === "forgot to checkout") updatedRows[index].correctedCheckIn = "";
    }

    setRows(updatedRows);
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);
  const removeRow = (index) =>
    rows.length > 1 && setRows(rows.filter((_, i) => i !== index));

  useEffect(() => {
    rowRefs.current[rowRefs.current.length - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [rows]);

  const validateRows = () => {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.date) return toast.error(`Row ${i + 1}: Date is required`, { toastId: TOAST_ID });
      if (!r.regularizationType) return toast.error(`Row ${i + 1}: Type is required`, { toastId: TOAST_ID });
      if (r.regularizationType !== "forgot to checkout" && !r.correctedCheckIn)
        return toast.error(`Row ${i + 1}: Check-in is required`, { toastId: TOAST_ID });
      if (r.regularizationType !== "forgot to checkin" && !r.correctedCheckOut)
        return toast.error(`Row ${i + 1}: Check-out is required`, { toastId: TOAST_ID });
      if (!r.reason) return toast.error(`Row ${i + 1}: Reason is required`, { toastId: TOAST_ID });
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateRows()) return;

    const payload = rows.map((r) => ({
      employee_id: 1,
      date: r.date,
      regularization_type: r.regularizationType,
      corrected_check_in: r.regularizationType !== "forgot to checkout" ? r.correctedCheckIn : null,
      corrected_check_out: r.regularizationType !== "forgot to checkin" ? r.correctedCheckOut : null,
      reason: r.reason,
    }));

    try {
      const res = await fetch("http://localhost:8000/api/regularization/apply/multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests: payload }),
      });
      const data = await res.json();

      // if (!res.ok) return toast.error(`Backend Error: ${data.detail}`, { toastId: TOAST_ID });

      toast.success("Regularization requests submitted!", { toastId: TOAST_ID });
      setRows([emptyRow]);
      onClose();
    } catch {
      toast.error("Backend unreachable!", { toastId: TOAST_ID });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={formClasses.overlay} onClick={onClose} />
      <div className={formClasses.drawer}>
        {/* Header */}
        <div className={formClasses.header}>
          <h2 className={formClasses.headerTitle}>Regularization Request</h2>
          <button className={formClasses.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={formClasses.body}>
          {rows.map((row, index) => (
            <div
              key={index}
              ref={(el) => (rowRefs.current[index] = el)}
              className="border border-gray-200 rounded-lg p-4 flex flex-col gap-4"
            >
              {/* Date */}
              <div>
                <label className={formClasses.fieldLabel}>
                  Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  className={formClasses.inputClass}
                />
              </div>

              {/* Type */}
              <div>
                <label className={formClasses.fieldLabel}>
                  Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={row.regularizationType}
                  onChange={(e) => handleChange(index, "regularizationType", e.target.value)}
                  className={formClasses.selectClass}
                >
                  <option value="">Select</option>
                  <option value="forgot to checkin">Forgot to check-in</option>
                  <option value="forgot to checkout">Forgot to check-out</option>
                  <option value="Work From Home">Work From Home</option>
                </select>
              </div>

              {/* Check-in */}
              {row.regularizationType !== "forgot to checkout" && (
                <div>
                  <label className={formClasses.fieldLabel}>
                    Check-in <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    value={row.correctedCheckIn}
                    onChange={(e) => handleChange(index, "correctedCheckIn", e.target.value)}
                    className={formClasses.inputClass}
                  />
                </div>
              )}

              {/* Check-out */}
              {row.regularizationType !== "forgot to checkin" && (
                <div>
                  <label className={formClasses.fieldLabel}>
                    Check-out <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    value={row.correctedCheckOut}
                    onChange={(e) => handleChange(index, "correctedCheckOut", e.target.value)}
                    className={formClasses.inputClass}
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className={formClasses.fieldLabel}>
                  Reason <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={row.reason}
                  onChange={(e) => handleChange(index, "reason", e.target.value)}
                  className={formClasses.inputClass}
                />
              </div>

              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-500 font-semibold self-start"
                >
                  ✕ Remove Row
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="text-blue-700 font-bold flex items-center gap-2 mb-4"
          >
            <span className="text-2xl">+</span> Add More
          </button>

          <div className={formClasses.footer}>
            <button type="button" onClick={onClose} className={formClasses.buttonSecondary}>
              Cancel
            </button>
            <button type="submit" className={formClasses.buttonPrimary}>
              Submit
            </button>
          </div>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}
