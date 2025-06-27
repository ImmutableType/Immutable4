// components/proposals/forms/ProposalForm.tsx
'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from './MarkdownEditor';
import FundingGoalInput from './FundingGoalInput';

// Form steps
enum FormStep {
  BasicInfo = 0,
  DetailedDescription = 1,
  AdditionalDetails = 2,
  Preview = 3,
  Submitting = 4,
  Success = 5,
  Error = 6
}

// Categories available
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
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BasicInfo);
  const [formData, setFormData] = useState({
    title: '',
    tldr: '', // Short description (TLDR)
    category: '',
    location: 'Miami', // Fixed for MVP
    description: '',
    timeline: '',
    tags: [] as string[],
    contentFormat: '',
    fundingGoal: 2.0
  });
  
  const [errors, setErrors] = useState({
    title: '',
    tldr: '',
    category: '',
    description: '',
    timeline: '',
    contentFormat: '',
    fundingGoal: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle markdown editor changes
  const handleMarkdownChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    
    // Clear error when description is changed
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  // Handle funding goal changes
  const handleFundingGoalChange = (value: number) => {
    setFormData(prev => ({ ...prev, fundingGoal: value }));
  };

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Add tag to the list
  const addTag = () => {
    if (tagInput.trim() !== '' && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag from the list
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle Enter key for tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Validate form fields for the current step
  const validateCurrentStep = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (currentStep === FormStep.BasicInfo) {
      // Title validation
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
        isValid = false;
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be 100 characters or less';
        isValid = false;
      }
      
      // TLDR validation
      if (!formData.tldr.trim()) {
        newErrors.tldr = 'TLDR is required';
        isValid = false;
      } else if (formData.tldr.length > 200) {
        newErrors.tldr = 'TLDR must be 200 characters or less';
        isValid = false;
      }
      
      // Category validation
      if (!formData.category) {
        newErrors.category = 'Category is required';
        isValid = false;
      }
    } else if (currentStep === FormStep.DetailedDescription) {
      // Description validation
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      } else {
        // Word count validation - roughly 200 words
        const wordCount = formData.description.trim().split(/\s+/).length;
        if (wordCount > 200) {
          newErrors.description = 'Description must be 200 words or less';
          isValid = false;
        }
      }
    } else if (currentStep === FormStep.AdditionalDetails) {
      // Timeline validation
      if (!formData.timeline.trim()) {
        newErrors.timeline = 'Timeline is required';
        isValid = false;
      }
      
      // Content format validation
      if (!formData.contentFormat.trim()) {
        newErrors.contentFormat = 'Content format is required';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Move to the next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Move to the previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setCurrentStep(FormStep.Submitting);
      setIsSubmitting(true);
      
      // In a real app, we would upload content to IPFS here
      // and then mint the proposal on the blockchain





      
    // Placeholder - proposal submission not implemented in production
const result = { success: false, error: 'Proposal creation not implemented in production' };










      
      // Show success state
      setCurrentStep(FormStep.Success);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/news-proposals');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setSubmissionError('There was an error submitting your proposal. Please try again.');
      setCurrentStep(FormStep.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case FormStep.BasicInfo:
        return (
          <div className="form-step">
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Basic Information
            </h2>
            
            {/* Title Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="title" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                Title <span style={{ color: '#B3211E' }}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a concise, descriptive title for your proposal"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: errors.title ? '1px solid #B3211E' : '1px solid #D9D9D9',
                  fontSize: '16px'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '4px',
                fontSize: '14px' 
              }}>
                {errors.title && (
                  <span style={{ color: '#B3211E' }}>{errors.title}</span>
                )}
                <span style={{ color: formData.title.length > 100 ? '#B3211E' : '#6c757d' }}>
                  {formData.title.length}/100
                </span>
              </div>
            </div>
            
            {/* TLDR Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="tldr" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                TLDR (Short Description) <span style={{ color: '#B3211E' }}>*</span>
              </label>
              <textarea
                id="tldr"
                name="tldr"
                value={formData.tldr}
                onChange={handleChange}
                placeholder="Provide a brief summary of your proposal (200 characters max)"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: errors.tldr ? '1px solid #B3211E' : '1px solid #D9D9D9',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '4px',
                fontSize: '14px' 
              }}>
                {errors.tldr && (
                  <span style={{ color: '#B3211E' }}>{errors.tldr}</span>
                )}
                <span style={{ color: formData.tldr.length > 200 ? '#B3211E' : '#6c757d' }}>
                  {formData.tldr.length}/200
                </span>
              </div>
            </div>
            
            {/* Category Dropdown */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="category" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
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
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span style={{ 
                  color: '#B3211E', 
                  fontSize: '14px', 
                  display: 'block', 
                  marginTop: '4px' 
                }}>
                  {errors.category}
                </span>
              )}
            </div>
            
            {/* Location Input (Disabled/Fixed for MVP) */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="location" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
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
              <span style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                display: 'block', 
                marginTop: '4px' 
              }}>
                Location is fixed to Miami for the MVP
              </span>
            </div>
            
            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '32px' 
            }}>
              <button
                onClick={handleNextStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Next: Detailed Description
              </button>
            </div>
          </div>
        );
      
      case FormStep.DetailedDescription:
        return (
          <div className="form-step">
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Detailed Description
            </h2>
            
            {/* Markdown Editor */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                Description <span style={{ color: '#B3211E' }}>*</span>
              </label>
              <p style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '12px' 
              }}>
                Describe your proposal in detail. What should be investigated? Why is it important? (200 words max)
              </p>
              
              <MarkdownEditor
                value={formData.description}
                onChange={handleMarkdownChange}
                error={errors.description}
              />
            </div>
            
            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '32px' 
            }}>
              <button
                onClick={handlePrevStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'white',
                  color: '#000000',
                  border: '1px solid #D9D9D9',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Next: Additional Details
              </button>
            </div>
          </div>
        );
      
      case FormStep.AdditionalDetails:
        return (
          <div className="form-step">
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Additional Details
            </h2>
            
            {/* Timeline Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="timeline" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                Expected Timeline <span style={{ color: '#B3211E' }}>*</span>
              </label>
              <input
                type="text"
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="e.g., '2-3 weeks', '1 month', etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: errors.timeline ? '1px solid #B3211E' : '1px solid #D9D9D9',
                  fontSize: '16px'
                }}
              />
              {errors.timeline && (
                <span style={{ 
                  color: '#B3211E', 
                  fontSize: '14px', 
                  display: 'block', 
                  marginTop: '4px' 
                }}>
                  {errors.timeline}
                </span>
              )}
            </div>
            
            {/* Content Format Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="contentFormat" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                Deliverable Format <span style={{ color: '#B3211E' }}>*</span>
              </label>
              <input
                type="text"
                id="contentFormat"
                name="contentFormat"
                value={formData.contentFormat}
                onChange={handleChange}
                placeholder="e.g., 'Written article', 'Photo essay', 'Interview series', etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: errors.contentFormat ? '1px solid #B3211E' : '1px solid #D9D9D9',
                  fontSize: '16px'
                }}
              />
              {errors.contentFormat && (
                <span style={{ 
                  color: '#B3211E', 
                  fontSize: '14px', 
                  display: 'block', 
                  marginTop: '4px' 
                }}>
                  {errors.contentFormat}
                </span>
              )}
            </div>
            
            {/* Tags Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
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
                  onClick={addTag}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              {/* Display selected tags */}
              {formData.tags.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px', 
                  marginTop: '12px' 
                }}>
                  {formData.tags.map(tag => (
                    <div 
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: '16px',
                        fontSize: '14px'
                      }}
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6c757d',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          width: '18px',
                          height: '18px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Funding Goal Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500'
              }}>
                Funding Goal
              </label>
              <FundingGoalInput
                value={formData.fundingGoal}
                onChange={handleFundingGoalChange}
              />
            </div>
            
            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '32px' 
            }}>
              <button
                onClick={handlePrevStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'white',
                  color: '#000000',
                  border: '1px solid #D9D9D9',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Preview & Submit
              </button>
            </div>
          </div>
        );
      
      case FormStep.Preview:
        return (
          <div className="form-step">
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Preview Your Proposal
            </h2>
            
            {/* Preview Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #D9D9D9',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  fontFamily: "'Special Elite', monospace"
                }}>
                  {formData.title}
                </h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#1D7F6E',
                  backgroundColor: 'rgba(29, 127, 110, 0.1)',
                  border: '1px solid #1D7F6E'
                }}>
                  Active
                </span>
              </div>

              <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '16px' }}>
                Proposed by: 0x1234...5678 • Just now
              </p>

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

              <p style={{ 
                fontSize: '18px', 
                lineHeight: '1.6',
                fontStyle: 'italic',
                marginBottom: '16px',
                padding: '16px',
                borderLeft: '3px solid #B3211E',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }}>
                {formData.tldr}
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontFamily: "'Special Elite', monospace"
                }}>
                  Description
                </h4>
                <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {formData.description.split('\n').map((line, i) => (
                    <p key={i} style={{ marginBottom: '12px' }}>{line}</p>
                  ))}
                </div>
              </div>
              
              {formData.tags.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    marginBottom: '12px',
                    fontFamily: "'Special Elite', monospace"
                  }}>
                    Tags
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.tags.map(tag => (
                      <span 
                        key={tag}
                        style={{ 
                          backgroundColor: 'rgba(0,0,0,0.05)', 
                          padding: '4px 12px', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontFamily: "'Special Elite', monospace"
                }}>
                  Timeline
                </h4>
                <p>{formData.timeline}</p>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontFamily: "'Special Elite', monospace"
                }}>
                  Deliverable Format
                </h4>
                <p>{formData.contentFormat}</p>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontFamily: "'Special Elite', monospace"
                }}>
                  Funding Goal
                </h4>
                <p>${formData.fundingGoal.toFixed(1)}</p>
              </div>
            </div>
            
            {/* Terms Agreement */}
            <div style={{ 
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0,0,0,0.02)',
              border: '1px solid #D9D9D9'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                cursor: 'pointer' 
              }}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  style={{ marginTop: '4px' }} 
                />
                <div>
                  <p style={{ marginBottom: '4px', fontWeight: '500' }}>
                    I agree to the terms and conditions
                  </p>
                  <p style={{ fontSize: '14px', color: '#6c757d' }}>
                    By submitting this proposal, I confirm that all information provided is accurate and that I have the right to publish this content. I understand that the community will be able to vote on and fund this proposal.
                  </p>
                </div>
              </label>
            </div>
            
            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '32px' 
            }}>
              <button
                onClick={handlePrevStep}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'white',
                  color: '#000000',
                  border: '1px solid #D9D9D9',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#B3211E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Submit Proposal
              </button>
            </div>
          </div>
        );
      
      case FormStep.Submitting:
        return (
          <div className="form-step" style={{ textAlign: 'center', padding: '48px 0' }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Submitting Your Proposal
            </h2>
            <p style={{ marginBottom: '32px' }}>
              Please wait while we submit your proposal to the blockchain...
            </p>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid rgba(0,0,0,0.1)', 
              borderTopColor: '#B3211E', 
              borderRadius: '50%', 
              margin: '0 auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      
      case FormStep.Success:
        return (
          <div className="form-step" style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(29, 127, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <span style={{ 
                fontSize: '48px', 
                color: '#1D7F6E'
              }}>
                ✓
              </span>
            </div>
            
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Proposal Submitted Successfully!
            </h2>
            
            <p style={{ marginBottom: '32px' }}>
              Your proposal has been created and is now visible to the community.
            </p>
            
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Redirecting to proposals list...
            </p>
          </div>
        );
      
      case FormStep.Error:
        return (
          <div className="form-step" style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(179, 33, 30, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <span style={{ 
                fontSize: '48px', 
                color: '#B3211E'
              }}>
                !
              </span>
            </div>
            
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Submission Error
            </h2>
            
            <p style={{ marginBottom: '32px' }}>
              {submissionError || 'There was an error submitting your proposal. Please try again.'}
            </p>
            
            <button
              onClick={() => setCurrentStep(FormStep.Preview)}
              style={{
                padding: '10px 24px',
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Back to Preview
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Progress bar steps
  const steps = [
    'Basic Info',
    'Description',
    'Details',
    'Review'
  ];

  return (
    <div className="proposal-form">
      {/* Progress Indicators (not shown for submitting, success, or error states) */}
      {currentStep < FormStep.Submitting && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index <= currentStep ? '#000000' : 'white',
                  border: '2px solid',
                  borderColor: index <= currentStep ? '#000000' : '#D9D9D9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  color: index <= currentStep ? 'white' : '#6c757d',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>
                <span style={{ 
                  fontSize: '14px',
                  color: index <= currentStep ? '#000000' : '#6c757d',
                  fontWeight: index <= currentStep ? '500' : 'normal'
                }}>
                  {step}
                </span>
              </div>
            ))}
            
            {/* Progress Line */}
            <div style={{ 
              position: 'absolute', 
              top: '16px', 
              left: '16px', 
              right: '16px', 
              height: '2px', 
              backgroundColor: '#D9D9D9',
              zIndex: 1
            }}>
              <div style={{ 
                height: '100%', 
                width: `${(currentStep / (steps.length - 1)) * 100}%`, 
                backgroundColor: '#000000' 
              }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Current Step Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9'
      }}>
        {renderStep()}
      </div>
    </div>
  );
}