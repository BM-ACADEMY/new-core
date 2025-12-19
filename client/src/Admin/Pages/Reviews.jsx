import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { showToast } from '@/utils/customToast';

// shadcn/ui components (Assumed installed)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Pencil, Trash2, Calendar } from "lucide-react";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingReview, setViewingReview] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', work: '', content: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/review');
      setReviews(response.data.data || []);
    } catch (err) {
      showToast('error', 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const response = await axiosInstance.put(`/review/${editingId}`, formData);
        setReviews(prev => prev.map(r => r._id === editingId ? response.data.data : r));
        showToast('success', 'Review updated');
      } else {
        const response = await axiosInstance.post('/review', formData);
        setReviews(prev => [response.data.data, ...prev]);
        showToast('success', 'Review added');
      }
      closeModal();
    } catch (err) {
      showToast('error', 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setFormData({ name: review.name, work: review.work || '', content: review.content });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axiosInstance.delete(`/review/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      showToast('success', 'Deleted successfully');
    } catch (err) {
      showToast('error', 'Delete failed');
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', work: '', content: '' });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground text-sm">Manage and view your customer feedback.</p>
        </div>
        
        {/* ADD/EDIT MODAL */}
        <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Review' : 'Create New Review'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work">Work/Position</Label>
                <Input id="work" name="work" value={formData.work} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Review Message</Label>
                <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} className="h-32" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Post Review'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[200px]">Customer</TableHead>
              <TableHead>Work</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell className="font-medium">{review.name}</TableCell>
                  <TableCell>{review.work || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewingReview(review)}>
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(review)}>
                      <Pencil className="w-4 h-4 text-amber-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(review._id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* VIEW MESSAGE MODAL */}
      <Dialog open={!!viewingReview} onOpenChange={() => setViewingReview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               Review from {viewingReview?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border italic text-slate-700 leading-relaxed">
              "{viewingReview?.content}"
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Posted on {new Date(viewingReview?.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Button onClick={() => setViewingReview(null)} className="w-full">Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reviews;