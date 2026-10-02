'use client';

import { useState } from 'react';
import ArticleLayout from '@/components/site/ArticleLayout';
import StatusText from '@/components/ui/StatusText';

const DETAILS = [
  { label: 'Email', value: <a href="mailto:contact@sleepcoding.me" className="sc-link">contact@sleepcoding.me</a> },
  { label: 'Phone', value: <a href="tel:207-358-9026" className="sc-link">207-358-9026</a> },
  { label: 'Mail', value: 'PO BOX 2803, South Portland, ME 04116' },
  { label: 'Response', value: 'Usually within 72 hours' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleLayout eyebrow="Contact" title="Get in touch." dek="Questions about your account, billing, or a session. A person reads every message.">
      <dl>
        {DETAILS.map((item) => (
          <div key={item.label} className="sc-row flex items-baseline gap-4">
            <dt className="sc-label w-[84px] flex-shrink-0">{item.label}</dt>
            <dd className="text-[14px] text-fg">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="sc-eyebrow mt-10">Send a Message</div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 wide:max-w-[560px]">
        <div>
          <label htmlFor="name" className="sc-label">Name</label>
          <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="sc-input" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="sc-label">Email</label>
          <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="sc-input" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="subject" className="sc-label">Subject</label>
          <select id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="sc-input">
            <option value="">Choose one</option>
            <option value="general">General Inquiry</option>
            <option value="technical">Technical Support</option>
            <option value="billing">Billing Question</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="sc-label">Message</label>
          <textarea id="message" name="message" required rows={5} value={formData.message} onChange={handleChange} className="sc-input" placeholder="What can we help with?" />
        </div>

        <StatusText
          status={
            submitStatus === 'success'
              ? { type: 'success', text: 'Thanks. We’ll get back to you soon.' }
              : submitStatus === 'error'
                ? { type: 'error', text: 'Your message didn’t send. Please try again.' }
                : null
          }
        />

        <div>
          <button type="submit" disabled={isSubmitting} className="sc-cta">
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>
        </div>
      </form>
    </ArticleLayout>
  );
}
