// src/services/workflowService.ts
import axios from 'axios';

// import.meta.env may not be typed in some TS configs; cast to any to avoid type errors
const API = (import.meta as any).env?.VITE_API_URL || '';

export interface WorkflowTemplateMetaType {
  inferredTitle: string;
  inferredQuery: string;
  inferredFormat: string;
  inferredStyle: string;
  placeholders: string[];
  documentType: string;
  summary: string;
}

export interface Workflow {
  _id: string;
  title: string;
  query: string;
  format?: string;
  style?: string;
  tags: string[];
  shareWithOrg: boolean;
  sourceMethod: 'scratch' | 'template';
  templateFileUrl?: string;
  templateMeta?: WorkflowTemplateMetaType;
  usageCount: number;
  isCurated?: boolean;
  iconKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowPayload {
  title: string;
  query: string;
  format?: string;
  style?: string;
  tags?: string[];
  shareWithOrg?: boolean;
  sourceMethod?: 'scratch' | 'template';
  templateFile?: File | null;
}

export interface ListWorkflowsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const workflowService = {
  async create(payload: CreateWorkflowPayload): Promise<Workflow> {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('query', payload.query);
    if (payload.format) form.append('format', payload.format);
    if (payload.style) form.append('style', payload.style);
    if (payload.tags) form.append('tags', JSON.stringify(payload.tags));
    form.append('shareWithOrg', String(payload.shareWithOrg ?? false));
    form.append('sourceMethod', payload.sourceMethod ?? 'scratch');
    if (payload.templateFile) form.append('templateFile', payload.templateFile);

    const res = await axios.post(`${API}/api/workflows`, form, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    });
    return res.data.workflow;
  },

  async list(params: ListWorkflowsParams = {}): Promise<{ workflows: Workflow[]; total: number }> {
    const res = await axios.get(`${API}/api/workflows`, {
      params,
      headers: getAuthHeader(),
    });
    return res.data;
  },

  async getCurated(category?: string): Promise<Workflow[]> {
    const res = await axios.get(`${API}/api/workflows/curated`, {
      params: { category },
      headers: getAuthHeader(),
    });
    return res.data.workflows;
  },

  async get(id: string): Promise<Workflow> {
    const res = await axios.get(`${API}/api/workflows/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data.workflow;
  },

  async update(id: string, payload: Partial<CreateWorkflowPayload>): Promise<Workflow> {
    const res = await axios.put(`${API}/api/workflows/${id}`, payload, {
      headers: getAuthHeader(),
    });
    return res.data.workflow;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${API}/api/workflows/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async run(id: string, documentText: string, documentId?: string): Promise<{ result: string; executedAt: string }> {
    const res = await axios.post(
      `${API}/api/workflows/${id}/run`,
      { documentText, documentId },
      { headers: getAuthHeader() }
    );
    return res.data;
  },
};