'use client';

import { useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

interface Comment {
	_id: string;
	content: string;
	createdAt: string;
	guestName?: string;
	user?: {
		_id: string;
		name: string;
		image?: string;
	};
	replies?: Comment[];
}

interface CommentSectionProps {
	slug: string;
	initialComments?: Comment[];
	initialIsAuthenticated?: boolean;
	authorId?: string;
}

export function CommentSection({
	slug,
	initialComments = [],
	initialIsAuthenticated = false,
	authorId,
}: CommentSectionProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState<Comment[]>(initialComments);
	const [newComment, setNewComment] = useState('');
	const [guestName, setGuestName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState('');
	const [replyGuestName, setReplyGuestName] = useState('');
	const [deletingComment, setDeletingComment] = useState<string | null>(null);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const handleSubmitComment = async () => {
		if (!newComment.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/startups/${slug}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content: newComment.trim(),
					guestName: (session as any)?.id ? undefined : guestName.trim(),
				}),
			});

			if (response.ok) {
				const data = await response.json();
				const created: Comment | undefined = data?.comment;
				if (created) {
					setComments((prev) => [...prev, created]);
				}
				setNewComment('');
				setGuestName('');
			}
		} catch (error) {
			console.error('Comment submission error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmitReply = async (parentCommentId: string) => {
		if (!replyContent.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/startups/${slug}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content: replyContent.trim(),
					parentCommentId,
					guestName: (session as any)?.id ? undefined : replyGuestName.trim(),
				}),
			});

			if (response.ok) {
				const data = await response.json();
				const created: Comment | undefined = data?.comment;
				if (created) {
					setComments((prev) =>
						prev.map((c) =>
							c._id === parentCommentId ?
								{ ...c, replies: [...(c.replies || []), created] }
							:	c,
						),
					);
				}
				setReplyContent('');
				setReplyGuestName('');
				setReplyingTo(null);
			}
		} catch (error) {
			console.error('Reply submission error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		if (!(session as any)?.id || deletingComment) return;

		setDeletingComment(commentId);
		try {
			const response = await fetch(
				`/api/startups/${slug}/comments/${commentId}`,
				{
					method: 'DELETE',
				},
			);

			if (response.ok) {
				// Refresh comments
				const commentsResponse = await fetch(`/api/startups/${slug}/comments`);
				if (commentsResponse.ok) {
					const commentsData = await commentsResponse.json();
					setComments(commentsData.comments);
				}
			}
		} catch (error) {
			console.error('Comment deletion error:', error);
		} finally {
			setDeletingComment(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Comment Form */}
			<div className="border-t pt-6">
				<h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
				<div className="space-y-3">
					{!(session as any)?.id && (
						<input
							type="text"
							value={guestName}
							onChange={(e) => setGuestName(e.target.value)}
							placeholder="Your name (required to comment)"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm"
							maxLength={50}
						/>
					)}
					<Textarea
						placeholder="Share your thoughts..."
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className="min-h-[100px] resize-none"
						maxLength={1000}
					/>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">
							{newComment.length}/1000 characters
						</span>
						<Button
							onClick={handleSubmitComment}
							disabled={
								!newComment.trim() ||
								(!(session as any)?.id && guestName.trim().length === 0) ||
								isSubmitting
							}
							className="flex items-center gap-2">
							<Send className="w-4 h-4" />
							{isSubmitting ? 'Posting...' : 'Post Comment'}
						</Button>
					</div>
				</div>
			</div>

			{/* Comments List */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

				{comments.length === 0 ?
					<p className="text-gray-500 italic">
						No comments yet. Be the first to comment!
					</p>
				:	<div className="space-y-4">
						{comments.map((comment) => (
							<div
								key={comment._id}
								className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
								<div className="flex items-start gap-3">
									<Avatar className="w-8 h-8">
										<AvatarImage src={comment.user?.image} />
										<AvatarFallback>
											{(comment.user?.name || comment.guestName || 'G')
												?.charAt(0)
												?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">
												{comment.user?.name || comment.guestName || 'Guest'}
											</span>
											<span className="text-xs text-gray-500">
												{formatDate(comment.createdAt)}
											</span>
										</div>
										<p className="text-sm text-gray-700 dark:text-gray-300">
											{comment.content}
										</p>
										<div className="flex items-center gap-4">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setReplyingTo(comment._id)}
												className="text-xs h-6 px-2">
												<MessageCircle className="w-3 h-3 mr-1" />
												Reply
											</Button>
											{(((session as any)?.id &&
												comment.user?._id &&
												(session as any)?.id === comment.user._id) ||
												((session as any)?.id &&
													authorId &&
													(session as any)?.id === authorId)) && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteComment(comment._id)}
													disabled={deletingComment === comment._id}
													className="text-xs h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
													<Trash2 className="w-3 h-3 mr-1" />
													{deletingComment === comment._id ?
														'Deleting...'
													:	'Delete'}
												</Button>
											)}
										</div>

										{/* Reply Form */}
										{replyingTo === comment._id && (
											<div className="ml-4 space-y-2">
												{!(session as any)?.id && (
													<input
														type="text"
														value={replyGuestName}
														onChange={(e) => setReplyGuestName(e.target.value)}
														placeholder="Your name (required to reply)"
														className="w-full rounded-md border bg-background px-3 py-2 text-sm"
														maxLength={50}
													/>
												)}
												<Textarea
													placeholder="Write a reply..."
													value={replyContent}
													onChange={(e) => setReplyContent(e.target.value)}
													className="min-h-[60px] resize-none text-sm"
													maxLength={500}
												/>
												<div className="flex justify-between items-center">
													<span className="text-xs text-gray-500">
														{replyContent.length}/500 characters
													</span>
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setReplyingTo(null);
																setReplyContent('');
															}}>
															Cancel
														</Button>
														<Button
															size="sm"
															onClick={() => handleSubmitReply(comment._id)}
															disabled={
																!replyContent.trim() ||
																(!(session as any)?.id &&
																	replyGuestName.trim().length === 0) ||
																isSubmitting
															}>
															{isSubmitting ? 'Posting...' : 'Reply'}
														</Button>
													</div>
												</div>
											</div>
										)}

										{/* Replies */}
										{comment.replies && comment.replies.length > 0 && (
											<div className="ml-4 space-y-3">
												{comment.replies.map((reply) => (
													<div
														key={reply._id}
														className="flex items-start gap-3">
														<Avatar className="w-6 h-6">
															<AvatarImage src={reply.user?.image} />
															<AvatarFallback className="text-xs">
																{(reply.user?.name || reply.guestName || 'G')
																	?.charAt(0)
																	?.toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-2">
																	<span className="font-medium text-xs">
																		{reply.user?.name ||
																			reply.guestName ||
																			'Guest'}
																	</span>
																	<span className="text-xs text-gray-500">
																		{formatDate(reply.createdAt)}
																	</span>
																</div>
																{(((session as any)?.id &&
																	reply.user?._id &&
																	(session as any)?.id === reply.user._id) ||
																	((session as any)?.id &&
																		authorId &&
																		(session as any)?.id === authorId)) && (
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() =>
																			handleDeleteComment(reply._id)
																		}
																		disabled={deletingComment === reply._id}
																		className="text-xs h-5 px-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
																		<Trash2 className="w-2 h-2" />
																	</Button>
																)}
															</div>
															<p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
																{reply.content}
															</p>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				}
			</div>
		</div>
	);
}
