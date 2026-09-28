"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from '@/context/ToastContext';

import Nav from "@/app/components/Nav";
import { createTicket } from "@/lib/api";


const CATEGORIES = [
  "Order Issue",
  "Delivery Issue",
  "Product Issue",
  "Payment Issue",
  "Refund Issue",
  "Account Issue",
  "Other",
];


const PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];


export default function CreateTicketPage() {

  const router = useRouter();
    const { showToast }    = useToast();


  const [form, setForm] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
    attachmentUrl: "",
  });


  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);



  function update(field, value) {

    setForm((f) => ({
      ...f,
      [field]: value,
    }));

  }



  function validate() {

    const next = {};


    if (!form.subject.trim()) {
      next.subject = "Subject is required.";
    }


    if (!form.category) {
      next.category = "Choose a category.";
    }


    if (!form.priority) {
      next.priority = "Choose a priority.";
    }


    if (!form.description.trim()) {
      next.description = "Describe the issue.";
    }


    setErrors(next);

    return Object.keys(next).length === 0;
  }



  async function handleSubmit(e) {

    e.preventDefault();


    if (!validate()) {
      return;
    }


    setSubmitting(true);


    try {

      const ticket = await createTicket(form);


        console.log("Ticket created:");
        console.log(ticket);
  if(ticket.message==="Success"){
            showToast('Ticket created successfully!');
        router.push(`/tickets`);
  }else{
          router.push(`/login`);

  }


    } finally {

      setSubmitting(false);

    }

  }



  return (

    <main className="support-page">

      <Nav />


      <div className="support-container support-create-container">


        {/* =========================================
            PAGE HEADER
        ========================================== */}

        <div className="support-page-header">

          <div>

            <h1 className="support-page-title">
              Create a Support Ticket
            </h1>

            <p className="support-page-subtitle">
              Tell us what you're experiencing and our
              support team will help you resolve it.
            </p>

          </div>


          <button
            type="button"
            onClick={() => router.back()}
            className="support-btn support-btn-secondary"
          >
            ← Back
          </button>

        </div>



        {/* =========================================
            FORM CARD
        ========================================== */}

        <div className="support-card support-form-card">


          {/* CARD HEADER */}

          <div className="support-card-header">

            <h2 className="support-card-title">
              Submit a Support Request
            </h2>

            <p className="support-card-description">
              Please provide the details below so we can
              understand and resolve your issue quickly.
            </p>

          </div>



          {/* =========================================
              FORM
          ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="support-form"
          >


            {/* =====================================
                SUBJECT
            ====================================== */}

            <div className="support-form-group">

              <label className="support-form-label">
                Subject
                <span className="support-required">
                  *
                </span>
              </label>


              <input
                type="text"
                value={form.subject}
                onChange={(e) =>
                  update("subject", e.target.value)
                }
                placeholder="Briefly describe your issue"
                className={`support-form-input ${
                  errors.subject
                    ? "support-input-error"
                    : ""
                }`}
              />


              {errors.subject && (

                <span className="support-form-error">
                  {errors.subject}
                </span>

              )}

            </div>



            {/* =====================================
                CATEGORY + PRIORITY
            ====================================== */}

            <div className="support-form-row">


              {/* CATEGORY */}

              <div className="support-form-group">

                <label className="support-form-label">
                  Category
                  <span className="support-required">
                    *
                  </span>
                </label>


                <select
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value)
                  }
                  className={`support-form-input ${
                    errors.category
                      ? "support-input-error"
                      : ""
                  }`}
                >

                  <option value="">
                    Select a category
                  </option>


                  {CATEGORIES.map((category) => (

                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>

                  ))}

                </select>


                {errors.category && (

                  <span className="support-form-error">
                    {errors.category}
                  </span>

                )}

              </div>



              {/* PRIORITY */}

              <div className="support-form-group">

                <label className="support-form-label">
                  Priority
                  <span className="support-required">
                    *
                  </span>
                </label>


                <select
                  value={form.priority}
                  onChange={(e) =>
                    update("priority", e.target.value)
                  }
                  className={`support-form-input ${
                    errors.priority
                      ? "support-input-error"
                      : ""
                  }`}
                >

                  <option value="">
                    Select priority
                  </option>


                  {PRIORITIES.map((priority) => (

                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>

                  ))}

                </select>


                {errors.priority && (

                  <span className="support-form-error">
                    {errors.priority}
                  </span>

                )}

              </div>

            </div>



            {/* =====================================
                DESCRIPTION
            ====================================== */}

            <div className="support-form-group">

              <div className="support-label-row">

                <label className="support-form-label">
                  Description
                  <span className="support-required">
                    *
                  </span>
                </label>

                <span className="support-character-hint">
                  Provide as much detail as possible
                </span>

              </div>


              <textarea
                value={form.description}
                onChange={(e) =>
                  update("description", e.target.value)
                }
                rows={7}
                placeholder="Describe what happened, when it happened, and any steps you have already tried..."
                className={`support-form-input support-form-textarea ${
                  errors.description
                    ? "support-input-error"
                    : ""
                }`}
              />


              {errors.description && (

                <span className="support-form-error">
                  {errors.description}
                </span>

              )}

            </div>



            {/* =====================================
                ATTACHMENT
            ====================================== */}

            <div className="support-form-group">

              <label className="support-form-label">

                Attachment URL

                <span className="support-optional">
                  Optional
                </span>

              </label>


              <input
                type="text"
                value={form.attachmentUrl}
                onChange={(e) =>
                  update(
                    "attachmentUrl",
                    e.target.value
                  )
                }
                placeholder="https://example.com/attachment"
                className="support-form-input"
              />


              <p className="support-form-help">
                If you have a screenshot or document,
                provide its URL here.
              </p>

            </div>



            {/* =====================================
                DIVIDER
            ====================================== */}

            <div className="support-form-divider" />



            {/* =====================================
                ACTIONS
            ====================================== */}

            <div className="support-form-actions">

              <button
                type="button"
                onClick={() => router.back()}
                className="support-btn support-btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={submitting}
                className="support-btn support-btn-primary"
              >

                {submitting ? (
                  <>
                    <span className="support-button-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Ticket
                    <span>→</span>
                  </>
                )}

              </button>

            </div>

          </form>

        </div>



        {/* =========================================
            HELP INFORMATION
        ========================================== */}

        <div className="support-help-card">

          <div>

            <p className="support-help-title">
              Need immediate assistance?
            </p>

            <p className="support-help-text">
              Submit your ticket with as much detail as
              possible. Our support team will review it
              and respond to your request.
            </p>

          </div>

        </div>


      </div>

    </main>

  );

}

