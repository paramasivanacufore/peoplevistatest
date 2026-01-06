// import React, { useState, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   inputClass,
//   buttonPrimary,
//   buttonSecondary,
//   fieldLabel,
//   overlay,
//   drawer,
//   header,
//   headerTitle,
//   closeButton,
//   body,
//   footer,
// } from "../../../formClasses";

// export default function LeaveFormComponent({ onClose }) {
//   const [leaveTypes, setLeaveTypes] = useState([]);
//   const [loadingTypes, setLoadingTypes] = useState(true);

//   const today = new Date().toISOString().split("T")[0];

//   const [formData, setFormData] = useState({
//     leaveTypeId: "",
//     requestedToEmail: "1",
//     fromDate: today,
//     toDate: today,
//     totalDays: 1,
//     reason: "",
//   });

//   const TOAST_ID = "leave-request-toast";

//   useEffect(() => {
//     const fetchLeaveTypes = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/api/leave/types");
//         const data = await res.json();
//         console.log(JSON.stringify(data));
//         setLeaveTypes(data?.data || []);
//         if (data?.data?.length > 0) {
//           setFormData((prev) => ({
//             ...prev,
//             leaveTypeId: data.data[0].leave_type_id,
//           }));
//         }
//       } catch (err) {
//         console.error("Failed to load leave types:", err);
//         toast.error("Cannot load leave types. Check backend.", {
//           toastId: TOAST_ID,
//         });
//       } finally {
//         setLoadingTypes(false);
//       }
//     };
//     fetchLeaveTypes();
//   }, []);

//   const calculateDays = (from, to) => {
//     const start = new Date(from);
//     const end = new Date(to);
//     const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
//     return diff > 0 ? diff : 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedData = { ...formData, [name]: value };
//     if (name === "fromDate" || name === "toDate") {
//       updatedData.totalDays = calculateDays(
//         name === "fromDate" ? value : formData.fromDate,
//         name === "toDate" ? value : formData.toDate
//       );
//     }
//     setFormData(updatedData);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.reason || !formData.leaveTypeId) {
//       return toast.error("Please fill all required fields.", {
//         toastId: TOAST_ID,
//       });
//     }

//     const payload = {
//       employee_id: 1,
//       leave_type_id: Number(formData.leaveTypeId),
//       requested_to: formData.requestedToEmail || 1,
//       start_date: formData.fromDate,
//       end_date: formData.toDate,
//       comments: formData.reason,
//     };

//     try {
//       const res = await fetch("http://localhost:8000/api/leave/apply", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

     
//       toast.success("Leave request submitted successfully!", {
//         toastId: TOAST_ID,
//       });

//       setFormData({
//         leaveTypeId: formData.leaveTypeId,
//         requestedToEmail: "",
//         reason: "",
//         fromDate: today,
//         toDate: today,
//         totalDays: 1,
//       });
//       setTimeout(() => {
//         onClose();
//       }, 1500);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     }
//   };

//   if (loadingTypes) {
//     return (
//       <div className="flex items-center justify-center h-full text-gray-600 text-lg">
//         Loading leave types...
//       </div>
//     );
//   }

//   return (
//     <>
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className={overlay} onClick={onClose} />
//       <div className={drawer}>
//         {/* Header */}
//         <div className={header}>
//           <h2 className={headerTitle}>Leave Request Form</h2>
//           <button className={closeButton} onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* Body */}
//         <div className={body}>
//           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//             {/* Leave Type & Team Email */}
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1 flex flex-col">
//                 <label className={fieldLabel}>
//                   Leave Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="leaveTypeId"
//                   value={formData.leaveTypeId}
//                   onChange={handleChange}
//                   className={inputClass + " w-full"}
//                 >
//                   {leaveTypes?.map((lt) => (
//                     <option key={lt.leave_type_id} value={lt.leave_type_id}>
//                       {lt.leave_type_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex-1 flex flex-col">
//                 <label className={fieldLabel}>Team Email</label>
//                 <input
//                   type="text"
//                   name="requestedToEmail"
//                   value={formData.requestedToEmail}
//                   onChange={handleChange}
//                   placeholder="manager@example.com"
//                   className={inputClass + " w-full"}
//                 />
//               </div>
//             </div>

//             {/* From / To / Total Days */}
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1 flex flex-col">
//                 <label className={fieldLabel}>From Date *</label>
//                 <input
//                   type="date"
//                   name="fromDate"
//                   value={formData.fromDate}
//                   onChange={handleChange}
//                   className={inputClass + " w-full"}
//                 />
//               </div>

//               <div className="flex-1 flex flex-col">
//                 <label className={fieldLabel}>To Date *</label>
//                 <input
//                   type="date"
//                   name="toDate"
//                   value={formData.toDate}
//                   onChange={handleChange}
//                   className={inputClass + " w-full"}
//                 />
//               </div>

//               <div className="flex-1 flex flex-col">
//                 <label className={fieldLabel}>Total Days</label>
//                 <input
//                   type="number"
//                   value={formData.totalDays}
//                   readOnly
//                   className={inputClass + " bg-gray-100 text-gray-600 w-full"}
//                 />
//               </div>
//             </div>

//             {/* Reason */}
//             <div className="flex flex-col">
//               <label className={fieldLabel}>
//                 Reason <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="reason"
//                 value={formData.reason}
//                 onChange={handleChange}
//                 placeholder="Enter leave reason"
//                 className={inputClass + " w-full"}
//               />
//             </div>

//             {/* Footer Buttons */}
//             <div className={footer}>
//               <button
//                 type="button"
//                 className={buttonSecondary}
//                 onClick={onClose}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className={buttonPrimary}>
//                 Submit Leave
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  inputClass,
  buttonPrimary,
  buttonSecondary,
  fieldLabel,
  overlay,
  drawer,
  header,
  headerTitle,
  closeButton,
  body,
  footer,
} from "../../../formClasses";

export default function LeaveFormComponent({ onClose }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const backendUrl =
  import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    requestedToEmail: "",
    fromDate: today,
    toDate: today,
    totalDays: 1,
    reason: "",
  });

  const TOAST_ID = "leave-request-toast";

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/leave/types`);
        const data = await res.json();
        setLeaveTypes(data?.data || []);
        if (data?.data?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            leaveTypeId: data.data[0].leave_type_id,
          }));
        }
      } catch (err) {
        toast.error("Cannot load leave types.", { toastId: TOAST_ID });
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchLeaveTypes();
  }, []);

  const calculateDays = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    if (name === "fromDate" || name === "toDate") {
      updatedData.totalDays = calculateDays(
        name === "fromDate" ? value : formData.fromDate,
        name === "toDate" ? value : formData.toDate
      );
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leaveTypeId || !formData.reason) {
      return toast.error("Please fill all required fields.", {
        toastId: TOAST_ID,
      });
    }

    const payload = {
      employee_id: 1,
      leave_type_id: Number(formData.leaveTypeId),
      requested_to: formData.requestedToEmail || 1,
      start_date: formData.fromDate,
      end_date: formData.toDate,
      comments: formData.reason,
    };

    try {
      await fetch(`${backendUrl}/api/leave/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success("Leave request submitted successfully!", {
        toastId: TOAST_ID,
      });

      setTimeout(onClose, 1500);
    } catch (err) {
      toast.error("Something went wrong.", { toastId: TOAST_ID });
    }
  };

  if (loadingTypes) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading leave types...
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className={overlay} onClick={onClose} />

      <div className={drawer}>
        {/* Header */}
        <div className={header}>
          <h2 className={headerTitle}>Leave Request Form</h2>
          <button className={closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={body}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className={fieldLabel}>
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleChange}
                className={inputClass}
              >
                {leaveTypes.map((lt) => (
                  <option
                    key={lt.leave_type_id}
                    value={lt.leave_type_id}
                  >
                    {lt.leave_type_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={fieldLabel}>Team Email</label>
              <input
                type="text"
                name="requestedToEmail"
                value={formData.requestedToEmail}
                onChange={handleChange}
                placeholder="manager@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={fieldLabel}>From Date *</label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={fieldLabel}>To Date *</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={fieldLabel}>Total Days</label>
              <input
                type="number"
                readOnly
                value={formData.totalDays}
                className={`${inputClass} bg-gray-100 text-gray-600`}
              />
            </div>

            <div>
              <label className={fieldLabel}>
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter leave reason"
                className={inputClass}
              />
            </div>

            <div className={footer}>
              <button
                type="button"
                className={buttonSecondary}
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className={buttonPrimary}>
                Submit Leave
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
