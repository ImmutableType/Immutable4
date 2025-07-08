// components/proposals/forms/ProposalForm.tsx
'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from './MarkdownEditor';

interface ProposalFormData {
  // Basic Information
  title: string;
  tldr: string;
  category: string;
  location: string;
  referenceUrls: string[];
  
  // Story Details
  description: string;
  timeline: string;
  contentFormat: string;
  
  // NFT Configuration
  fundingGoal: number;
  nftCount: number;
  nftPrice: number; // Auto-calculated
  
  // Additional Information
  tags: string[];
  journalistRequirements: string;
}

const categories = [
  'Environment',
  'Business',
  'Education',
  'Technology',
  'Housing',
  'Community',
  'Arts & Culture',
  'Politics',
  'Health',
  'Sports'
];

export default function ProposalForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    tldr: '',
    category: '',
    location: 'Miami',
    referenceUrls: [],
    description: '',
    timeline: '',
    contentFormat: '',
    fundingGoal: 100,
    nftCount: 100,
    nftPrice: 1, // Will be auto-calculated
    tags: [],
    journalistRequirements: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Auto-calculate NFT price whenever funding goal or NFT count changes
  React.useEffect(() => {
    if (formData.nftCount > 0) {
      const price = formData.fundingGoal / formData.nftCount;
      setFormData(prev => ({ ...prev, nftPrice: price }));
    }
  }, [formData.fundingGoal, formData.nftCount]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (name === 'fundingGoal' || name === 'nftCount') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle markdown editor changes
  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  // Add reference URL
  const addReferenceUrl = () => {
    if (urlInput.trim() && formData.referenceUrls.length < 3) {
      // Basic URL validation
      try {
        new URL(urlInput);
        setFormData(prev => ({
          ...prev,
          referenceUrls: [...prev.referenceUrls, urlInput.trim()]
        }));
        setUrlInput('');
      } catch {
        setErrors(prev => ({ ...prev, referenceUrls: 'Please enter a valid URL' }));
      }
    }
  };

  // Remove reference URL
  const removeReferenceUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceUrls: prev.referenceUrls.filter((_, i) => i !== index)
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic Information validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (!formData.tldr.trim()) {
      newErrors.tldr = 'Summary is required';
    } else if (formData.tldr.length > 200) {
      newErrors.tldr = 'Summary must be 200 characters or less';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Story Details validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else {
      const wordCount = formData.description.trim().split(/\s+/).length;
      if (wordCount > 200) {
        newErrors.description = 'Description must be 200 words or less';
      }
    }
    
    if (!formData.timeline.trim()) {
      newErrors.timeline = 'Timeline is required';
    }
    
    if (!formData.contentFormat.trim()) {
      newErrors.contentFormat = 'Content format is required';
    }
    
    // NFT Configuration validation
    if (formData.fundingGoal < 10 || formData.fundingGoal > 10000) {
      newErrors.fundingGoal = 'Funding goal must be between 10 and 10,000 FLOW';
    }
    
    if (formData.nftCount < 10 || formData.nftCount > 10000) {
      newErrors.nftCount = 'NFT count must be between 10 and 10,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  // If showing confirmation, render the confirmation component
  if (showConfirmation) {
    return (
      <ProposalConfirmation 
        formData={formData}
        onBack={() => setShowConfirmation(false)}
        onConfirm={() => {
          // This will be handled by the next agent
          console.log('Minting proposal with data:', formData);
          router.push('/news-proposals');
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Basic Information Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Basic Information
        </h2>
        
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Title <span style={{ color: '#B3211E' }}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a concise, descriptive title"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: errors.title ? '1px solid #B3211E' : '1px solid #D9D9D9',
              fontSize: '16px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {errors.title && <span style={{ color: '#B3211E', fontSize: '14px' }}>{errors.title}</span>}
            <span style={{ color: formData.title.length > 100 ? '#B3211E' : '#6c757d', fontSize: '14px' }}>
              {formData.title.length}/100
            </span>
          </div>
        </div>
        
        {/* TLDR */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="tldr" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Summary (TLDR) <span style={{ color: '#B3211E' }}>*</span>
          </label>
          <textarea
            id="tldr"
            name="tldr"
            value={formData.tldr}
            onChange={handleChange}
            placeholder="Brief summary of your proposal"
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: errors.tldr ? '1px solid #B3211E' : '1px solid #D9D9D9',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {errors.tldr && <span style={{ color: '#B3211E', fontSize: '14px' }}>{errors.tldr}</span>}
            <span style={{ color: formData.tldr.length > 200 ? '#B3211E' : '#6c757d', fontSize: '14px' }}>
              {formData.tldr.length}/200
            </span>
          </div>
        </div>
        
        {/* Category and Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Category <span style={{ color: '#B3211E' }}>*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: errors.category ? '1px solid #B3211E' : '1px solid #D9D9D9',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span style={{ color: '#B3211E', fontSize: '14px' }}>{errors.category}</span>
            )}
          </div>
          
          <div>
            <label htmlFor="location" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Location <span style={{ color: '#B3211E' }}>*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              disabled
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #D9D9D9',
                fontSize: '16px',
                backgroundColor: '#f8f9fa'
              }}
            />
            <span style={{ fontSize: '12px', color: '#6c757d' }}>Fixed to Miami for MVP</span>
          </div>
        </div>
        
        {/* Reference URLs */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Reference Links (Optional, max 3)
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReferenceUrl())}
              placeholder="https://example.com"
              disabled={formData.referenceUrls.length >= 3}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
            <button
              type="button"
              onClick={addReferenceUrl}
              disabled={formData.referenceUrls.length >= 3}
              style={{
                padding: '10px 16px',
                backgroundColor: formData.referenceUrls.length >= 3 ? '#D9D9D9' : '#000000',
                color: formData.referenceUrls.length >= 3 ? '#6c757d' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: formData.referenceUrls.length >= 3 ? 'not-allowed' : 'pointer'
              }}
            >
              Add Link
            </button>
          </div>
          {errors.referenceUrls && (
            <span style={{ color: '#B3211E', fontSize: '14px' }}>{errors.referenceUrls}</span>
          )}
          {formData.referenceUrls.map((url, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <span style={{ flex: 1, fontSize: '14px', wordBreak: 'break-all' }}>{url}</span>
              <button
                type="button"
                onClick={() => removeReferenceUrl(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#B3211E',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Story Details Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Story Details
        </h2>
        
        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Description <span style={{ color: '#B3211E' }}>*</span>
          </label>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '12px' }}>
            Describe your proposal in detail. What should be investigated? Why is it important? (200 words max)
          </p>
          <MarkdownEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            error={errors.description}
          />
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#0066cc'
          }}>
            <strong>Honor System:</strong> Journalists are trusted to deliver quality work meeting proposer expectations.
          </div>
        </div>
        
        {/* Timeline and Content Format */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="timeline" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Expected Timeline <span style={{ color: '#B3211E' }}>*</span>
            </label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              placeholder="e.g., '2-3 weeks'"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: errors.timeline ? '1px solid #B3211E' : '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
            {errors.timeline && (
              <span style={{ color: '#B3211E', fontSize: '14px' }}>{errors.timeline}</span>
            )}
          </div>
          
          <div>
            <label htmlFor="contentFormat" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Deliverable Format <span style={{ color: '#B3211E' }}>*</span>
            </label>
            <input
              type="text"
              id="contentFormat"
              name="contentFormat"
              value={formData.contentFormat}
              onChange={handleChange}
              placeholder="e.g., 'Written article'"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: errors.contentFormat ? '1px solid #B3211E' : '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
            {errors.contentFormat && (
              <span style={{ color: '#B3211E', fontSize: '14px' }}>{errors.contentFormat}</span>
            )}
          </div>
        </div>
      </div>

      {/* NFT Configuration Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          NFT Funding Configuration
        </h2>
        
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
          Supporters pre-purchase NFTs to fund this story. Set your funding goal and number of NFTs available.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="fundingGoal" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Funding Goal (FLOW) <span style={{ color: '#B3211E' }}>*</span>
            </label>
            <input
              type="number"
              id="fundingGoal"
              name="fundingGoal"
              value={formData.fundingGoal}
              onChange={handleChange}
              min="10"
              max="10000"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: errors.fundingGoal ? '1px solid #B3211E' : '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
            {errors.fundingGoal && (
              <span style={{ color: '#B3211E', fontSize: '14px', display: 'block', marginTop: '4px' }}>
                {errors.fundingGoal}
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#6c757d' }}>Min: 10 FLOW, Max: 10,000 FLOW</span>
          </div>
          
          <div>
            <label htmlFor="nftCount" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Number of NFTs <span style={{ color: '#B3211E' }}>*</span>
            </label>
            <input
              type="number"
              id="nftCount"
              name="nftCount"
              value={formData.nftCount}
              onChange={handleChange}
              min="10"
              max="10000"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: errors.nftCount ? '1px solid #B3211E' : '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
            {errors.nftCount && (
              <span style={{ color: '#B3211E', fontSize: '14px', display: 'block', marginTop: '4px' }}>
                {errors.nftCount}
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#6c757d' }}>Min: 10, Max: 10,000</span>
          </div>
        </div>
        
        {/* Price Display */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            {formData.nftPrice.toFixed(2)} FLOW per NFT
          </div>
          <div style={{ fontSize: '16px', color: '#6c757d' }}>
            {formData.nftCount} NFTs at {formData.nftPrice.toFixed(2)} FLOW each = {formData.fundingGoal} FLOW goal
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Additional Information
        </h2>
        
        {/* Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Tags (Optional)
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags and press Enter"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
            <button
              type="button"
              onClick={addTag}
              style={{
                padding: '10px 16px',
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.tags.map(tag => (
                <div key={tag} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '16px',
                  fontSize: '14px'
                }}>
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6c757d',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Journalist Requirements */}
        <div>
          <label htmlFor="journalistRequirements" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Journalist Requirements (Optional)
          </label>
          <textarea
            id="journalistRequirements"
            name="journalistRequirements"
            value={formData.journalistRequirements}
            onChange={handleChange}
            placeholder="What qualifications or expertise should the journalist have?"
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #D9D9D9',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="submit"
          style={{
            padding: '12px 32px',
            backgroundColor: '#B3211E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Review Proposal
        </button>
      </div>
    </form>
  );
}

// Confirmation Component (inline for now, can be moved to separate file)
function ProposalConfirmation({ 
  formData, 
  onBack, 
  onConfirm 
}: { 
  formData: ProposalFormData;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const totalCost = 1.0 + formData.nftPrice; // 1 FLOW minting fee + 1 NFT purchase
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Review Your Proposal
        </h2>
        
        {/* Proposal Summary */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            {formData.title}
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontStyle: 'italic', color: '#6c757d' }}>{formData.tldr}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '4px 12px', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {formData.category}
            </span>
            <span style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '4px 12px', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {formData.location}
            </span>
          </div>
        </div>
        
        {/* NFT Economics */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            fontFamily: "'Special Elite', monospace"
          }}>
            NFT Pre-Sale Configuration
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Funding Goal</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{formData.fundingGoal} FLOW</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Number of NFTs</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{formData.nftCount}</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Price per NFT</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{formData.nftPrice.toFixed(2)} FLOW</p>
            </div>
          </div>
        </div>
        
        {/* Fee Breakdown */}
        <div style={{
          backgroundColor: '#fff5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #ffcccc'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            fontFamily: "'Special Elite', monospace"
          }}>
            Fee Breakdown
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Proposal Minting Fee:</span>
              <span style={{ fontWeight: 'bold' }}>1.0 FLOW</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Proposer NFT Purchase (1 NFT):</span>
              <span style={{ fontWeight: 'bold' }}>{formData.nftPrice.toFixed(2)} FLOW</span>
            </div>
            <div style={{ 
              borderTop: '1px solid #ffcccc', 
              paddingTop: '8px', 
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <span>Total Cost:</span>
              <span style={{ color: '#B3211E' }}>{totalCost.toFixed(2)} FLOW</span>
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '16px' }}>
            As the proposer, you're required to purchase the first NFT to demonstrate commitment to your proposal.
          </p>
        </div>
        
        {/* Terms */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ marginTop: '4px' }} />
            <div>
              <p style={{ marginBottom: '4px', fontWeight: '500' }}>I agree to the terms and conditions</p>
              <p style={{ fontSize: '14px', color: '#6c757d' }}>
                By minting this proposal, I confirm that all information provided is accurate and that I have 
                the right to publish this content. I understand that I must purchase the first NFT and that 
                the community will be able to vote on and fund this proposal.
              </p>
            </div>
          </label>
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#000000',
              border: '1px solid #D9D9D9',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back to Edit
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 32px',
              backgroundColor: '#B3211E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Mint Proposal ({totalCost.toFixed(2)} FLOW)
          </button>
        </div>
      </div>
    </div>
  );
}