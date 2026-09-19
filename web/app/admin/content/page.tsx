'use client';

import { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

const defaultContent = {
  heroTitle: 'Discover the Finest\nNatural Treasures',
  heroSubtitle:
    "Premium dates, artisan chocolates, and wellness products - curated from Morocco's most pristine sources.",
  heroCta: 'Shop the Collection',
  heroCtaSecondary: 'Our Story',
  brandStoryTitle: 'Rooted in Tradition,\nCrafted for Excellence',
  brandStoryBody:
    "Vibio was born from a simple belief: the finest natural products deserve to be shared with the world. From the sun-drenched palm groves of Tafilalet to the argan forests of the Souss Valley, we source directly from the artisans and farmers who pour their heritage into every harvest.",
  newsletterTitle: 'Join the Inner Circle',
  newsletterSubtitle:
    'Be the first to know about new collections, exclusive offers, and the stories behind our products.',
  aboutTitle: 'About Vibio',
  aboutBody:
    "We are a luxury e-commerce brand dedicated to bringing you the very best of Morocco's natural heritage. Every product in our collection is carefully selected for quality, authenticity, and provenance.",
  shippingFreeThreshold: '500',
  shippingFlatRate: '50',
  whatsappNumber: '+212600000000',
  instagramUrl: 'https://instagram.com/vibioofficial',
  facebookUrl: '',
  twitterUrl: '',
};

type ContentKey = keyof typeof defaultContent;

const sections = [
  {
    title: 'Hero Section',
    fields: [
      { key: 'heroTitle' as ContentKey, label: 'Hero Title', multiline: true },
      { key: 'heroSubtitle' as ContentKey, label: 'Hero Subtitle', multiline: true },
      { key: 'heroCta' as ContentKey, label: 'Primary CTA Button' },
      { key: 'heroCtaSecondary' as ContentKey, label: 'Secondary CTA Button' },
    ],
  },
  {
    title: 'Brand Story',
    fields: [
      { key: 'brandStoryTitle' as ContentKey, label: 'Section Title', multiline: true },
      { key: 'brandStoryBody' as ContentKey, label: 'Body Text', multiline: true },
    ],
  },
  {
    title: 'Newsletter',
    fields: [
      { key: 'newsletterTitle' as ContentKey, label: 'Title' },
      { key: 'newsletterSubtitle' as ContentKey, label: 'Subtitle' },
    ],
  },
  {
    title: 'About Page',
    fields: [
      { key: 'aboutTitle' as ContentKey, label: 'Page Title' },
      { key: 'aboutBody' as ContentKey, label: 'Body Text', multiline: true },
    ],
  },
  {
    title: 'Shipping & Logistics',
    fields: [
      { key: 'shippingFreeThreshold' as ContentKey, label: 'Free Shipping Threshold (MAD)' },
      { key: 'shippingFlatRate' as ContentKey, label: 'Flat Shipping Rate (MAD)' },
      { key: 'whatsappNumber' as ContentKey, label: 'WhatsApp Business Number' },
    ],
  },
  {
    title: 'Social Media',
    fields: [
      { key: 'instagramUrl' as ContentKey, label: 'Instagram URL' },
      { key: 'facebookUrl' as ContentKey, label: 'Facebook URL' },
      { key: 'twitterUrl' as ContentKey, label: 'Twitter / X URL' },
    ],
  },
];

export default function AdminContentPage() {
  const [content, setContent] = useState(defaultContent);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    setSaved(true);
    toast.success('Content saved successfully');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset all content to defaults?')) {
      setContent(defaultContent);
      toast.info('Content reset to defaults');
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-panel p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">Brand language</p>
            <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.94] tracking-[-0.06em] text-[#171C14]">
              Site content
            </h1>
            <p className="admin-subcopy mt-4 max-w-2xl">
              Manage the voice, editorial rhythm, and operational copy that shape the
              storefront experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleReset} className="admin-btn-secondary">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button onClick={handleSave} disabled={saving} className="admin-btn-primary disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save all'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="admin-panel p-6 sm:p-7">
            <p className="admin-eyebrow">{section.title}</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#171C14]">
              {section.title}
            </h2>
            <div className="mt-6 space-y-4">
              {section.fields.map(({ key, label, multiline }) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-medium text-[#3E433E]">{label}</label>
                  {multiline ? (
                    <textarea
                      value={content[key]}
                      onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      rows={4}
                      className="admin-textarea resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[key]}
                      onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      className="admin-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
