import {
	Users,
	BarChart3,
	Mail,
	PenTool,
	Eye,
	Calendar,
	Shield,
	Target,
	TrendingUp,
	Settings,
	Search,
	ImageIcon,
} from 'lucide-react';

export const features = [
	{
		icon: Users,
		title: 'Community Building',
		desc: 'Grow your audience with followers, comments, and engagement tools.',
		color: 'bg-indigo-600',
	},
	{
		icon: BarChart3,
		title: 'Analytics & Insights',
		desc: 'Track performance with detailed view counts and engagement metrics.',
		color: 'bg-indigo-600',
	},
	{
		icon: Calendar,
		title: 'Content Scheduling',
		desc: 'Plan and schedule your content with real-time updates.',
		color: 'bg-indigo-600',
	},
	{
		icon: Search,
		title: 'Content Discovery',
		desc: 'Explore trending content and discover new creators in your feed.',
		color: 'bg-indigo-600',
	},
];


export const socialProofStats = [
	{ metric: '50K+', label: 'Active Creators', icon: Users },
	{ metric: '2M+', label: 'Published Posts', icon: PenTool },
	{ metric: '10M+', label: 'Monthly Readers', icon: Eye },
	{ metric: '99.9%', label: 'Uptime', icon: Shield },
];



export const platformTabs = [
	{
		title: 'Content Creation',
		icon: PenTool,
		description:
			'AI-powered writing tools that help you create engaging content faster than ever before.',
		features: [
			'Smart title suggestions',
			'Content optimization',
			'SEO recommendations',
			'Plagiarism detection',
		],
	},
	{
		title: 'Audience Growth',
		icon: TrendingUp,
		description:
			'Build and engage your community with powerful audience management tools.',
		features: [
			'Follower analytics',
			'Engagement tracking',
			'Community insights',
			'Growth recommendations',
		],
	},
	{
		title: 'Content Management',
		icon: Settings,
		description:
			'Organize and manage your content with comprehensive tools and analytics.',
		features: [
			'Draft system',
			'Post scheduling',
			'Content analytics',
			'Media management',
		],
	},
];
