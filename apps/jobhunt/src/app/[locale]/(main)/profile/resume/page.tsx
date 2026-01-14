'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@bkamp/supabase/client';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

type TabType = 'upload' | 'manual';
type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete';

interface ManualForm {
  skills: string[];
  experienceYears: number;
  strengths: string[];
  summary: string;
}

export default function ResumeUploadPage() {
  const t = useTranslations('resume');
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('manual');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [analysis, setAnalysis] = useState<ManualForm | null>(null);

  // Manual form state
  const [manualForm, setManualForm] = useState<ManualForm>({
    skills: [],
    experienceYears: 0,
    strengths: ['', '', ''],
    summary: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      handleUpload(uploadedFile);
    }
  }, []);

  const handleUpload = async (uploadedFile: File) => {
    setUploadState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const { resume } = await res.json();
      setUploadState('analyzing');

      // Analyze the resume
      const analyzeRes = await fetch(`/api/resumes/${resume.id}/analyze`, {
        method: 'POST',
      });

      if (!analyzeRes.ok) {
        throw new Error('Analysis failed');
      }

      const { analysis: result } = await analyzeRes.json();
      setAnalysis({
        skills: result.skills || [],
        experienceYears: result.experienceYears || 0,
        strengths: result.strengths || [],
        summary: result.summary || '',
      });
      setUploadState('complete');
    } catch (err) {
      setError('업로드 또는 분석에 실패했습니다. 다시 시도해주세요.');
      setUploadState('idle');
      setFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setUploadState('idle');
    setAnalysis(null);
  };

  // Manual form handlers
  const addSkill = () => {
    if (skillInput.trim() && !manualForm.skills.includes(skillInput.trim())) {
      setManualForm({
        ...manualForm,
        skills: [...manualForm.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setManualForm({
      ...manualForm,
      skills: manualForm.skills.filter((s) => s !== skill),
    });
  };

  const updateStrength = (index: number, value: string) => {
    const newStrengths = [...manualForm.strengths];
    newStrengths[index] = value;
    setManualForm({ ...manualForm, strengths: newStrengths });
  };

  const handleManualSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // Save to jobhunt_profiles table
      const { error: dbError } = await supabase
        .from('jobhunt_profiles')
        .upsert({
          user_id: user.id,
          skills: manualForm.skills,
          experience_years: manualForm.experienceYears,
          strengths: manualForm.strengths.filter((s) => s.trim()),
          summary: manualForm.summary,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (dbError) {
        throw dbError;
      }

      router.push('/profile/preferences');
    } catch (err: any) {
      setError(err.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    router.push('/profile/preferences');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('upload.title')}</h1>
        <p className="text-gray-600 mt-1">이력서 정보를 입력하거나 파일을 업로드하세요</p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          직접 입력
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          파일 업로드
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* Manual Input Form */}
      {activeTab === 'manual' && (
        <div className="card p-6 space-y-6">
          {/* Skills */}
          <div>
            <label className="label">스킬</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input flex-1"
                placeholder="예: React, TypeScript, Python"
              />
              <button onClick={addSkill} className="btn-secondary px-3">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {manualForm.skills.map((skill) => (
                <span
                  key={skill}
                  className="badge-primary px-3 py-1 flex items-center gap-1"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience Years */}
          <div>
            <label className="label">경력 연수</label>
            <input
              type="number"
              value={manualForm.experienceYears}
              onChange={(e) => setManualForm({ ...manualForm, experienceYears: parseInt(e.target.value) || 0 })}
              className="input w-32"
              min="0"
              max="50"
            />
            <span className="ml-2 text-gray-500">년</span>
          </div>

          {/* Strengths */}
          <div>
            <label className="label">강점 (최대 3개)</label>
            <div className="space-y-2">
              {manualForm.strengths.map((strength, index) => (
                <input
                  key={index}
                  type="text"
                  value={strength}
                  onChange={(e) => updateStrength(index, e.target.value)}
                  className="input"
                  placeholder={`강점 ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="label">자기소개</label>
            <textarea
              value={manualForm.summary}
              onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
              className="input min-h-[120px]"
              placeholder="간단한 자기소개를 작성하세요"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleManualSubmit}
              disabled={saving || manualForm.skills.length === 0}
              className="btn-primary"
            >
              {saving ? '저장 중...' : '저장하고 계속'}
            </button>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <>
          {/* Upload Zone */}
          {uploadState === 'idle' && (
            <div
              {...getRootProps()}
              className={`card p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('upload.description')}
              </h3>
              <p className="text-gray-500 text-sm">{t('upload.formats')}</p>
            </div>
          )}

          {/* Uploading / Analyzing State */}
          {(uploadState === 'uploading' || uploadState === 'analyzing') && (
            <div className="card p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {uploadState === 'uploading' ? 'Uploading...' : t('upload.analyzing')}
              </h3>
              {file && (
                <p className="text-gray-500 text-sm">{file.name}</p>
              )}
            </div>
          )}

          {/* Complete State with Analysis */}
          {uploadState === 'complete' && analysis && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="card p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{file?.name}</h4>
                    <p className="text-sm text-green-600">Successfully analyzed</p>
                  </div>
                  <button onClick={removeFile} className="btn-ghost p-2">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <SparklesIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('analysis.title')}</h2>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{t('analysis.skills')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill) => (
                      <span key={skill} className="badge-primary px-3 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('analysis.experience')}</h3>
                  <p className="text-2xl font-bold text-gray-900">{analysis.experienceYears} years</p>
                </div>

                {/* Strengths */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{t('analysis.strengths')}</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                {analysis.summary && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">요약</h3>
                    <p className="text-gray-600">{analysis.summary}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button onClick={removeFile} className="btn-secondary">
                  다른 파일 업로드
                </button>
                <button onClick={handleContinue} className="btn-primary">
                  Continue to Preferences
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
