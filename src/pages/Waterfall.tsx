
import React, { useState } from 'react';
import { Heart, Plus, Send, X, Eye, MessageCircle } from 'lucide-react';
import { WaterfallPost } from '../types';

// 评论类型定义
interface Comment {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    likes: number;
}

// 扩展帖子类型，包含评论和样式
interface PostWithComments extends WaterfallPost {
    comments?: Comment[];
    rotation?: number; // 随机旋转角度
}

// 生成随机旋转角度（-3 到 3 度之间）
const getRandomRotation = () => (Math.random() - 0.5) * 6;

// Updated Categories with layout positioning for the scattered effect
const CATEGORIES = [
    { id: 'all', label: '全部', position: 'top-2 left-6 -rotate-6 scale-110' },
    { id: 'love', label: '爱情', position: 'top-14 left-[20%] -rotate-12' },
    { id: 'academic', label: '学业', position: 'top-20 left-[42%] rotate-6 scale-105' },
    { id: 'job', label: '就业', position: 'top-4 right-[12%] rotate-6' },
    { id: 'higher_edu', label: '升学', position: 'top-20 right-[8%] -rotate-3' },
    { id: 'rant', label: '吐槽', position: 'top-32 left-[32%] -rotate-2' },
    { id: 'part_time', label: '兼职', position: 'top-36 left-[8%] rotate-12' },
    { id: 'wish', label: '许愿', position: 'top-32 right-[20%] rotate-12' },
];

// Mock Data with comments - 预设旋转角度营造错落感
const MOCK_POSTS: PostWithComments[] = [
    {
        id: '1', title: '我想家了', content: '想念家里的红烧肉了... 食堂的饭虽然不错，但总少了一种味道。', views: 120, likes: 8, dislikes: 0, category: 'rant', timestamp: new Date(), bgColor: 'bg-rose-50', rotation: -2.5,
        comments: [
            { id: 'c1', content: '我也是！想念妈妈做的糖醋排骨', author: '匿名用户', timestamp: new Date(), likes: 3 },
            { id: 'c2', content: '学五食堂三楼有家红烧肉还不错，可以去试试', author: '热心学长', timestamp: new Date(), likes: 5 },
        ]
    },
    {
        id: '2', title: '关于那个窗边的男生', content: '图书馆二楼，每天坐窗边的男生，穿白色卫衣的那个，暗恋你很久了，不敢说话。如果你看到了，能不能...', views: 2300, likes: 20, dislikes: 0, category: 'love', timestamp: new Date(), bgColor: 'bg-pink-50', rotation: 1.8,
        comments: [
            { id: 'c3', content: '冲啊！勇敢说出来！', author: '恋爱达人', timestamp: new Date(), likes: 12 },
            { id: 'c4', content: '我好像知道是谁...', author: '图书馆常客', timestamp: new Date(), likes: 8 },
            { id: 'c5', content: '祝福祝福！', author: '吃瓜群众', timestamp: new Date(), likes: 2 },
        ]
    },
    {
        id: '3', title: '一切都会过去的', content: '大家考试周加油啊！', views: 890, likes: 5, dislikes: 0, category: 'academic', timestamp: new Date(), bgColor: 'bg-blue-50', rotation: -1.2,
        comments: [
            { id: 'c6', content: '谢谢！我们一起加油！', author: '考研人', timestamp: new Date(), likes: 4 },
        ]
    },
    {
        id: '4', title: '有的努力都值得！', content: '感谢师兄师姐的内推和帮助，还愿！', views: 1205, likes: 45, dislikes: 2, category: 'job', timestamp: new Date(), bgColor: 'bg-green-50', rotation: 2.3,
        comments: [
            { id: 'c7', content: '恭喜恭喜！是哪家公司呀？', author: '求职中', timestamp: new Date(), likes: 6 },
            { id: 'c8', content: '太棒了！沾沾喜气', author: '学弟学妹', timestamp: new Date(), likes: 3 },
        ]
    },
    {
        id: '5', title: '救命，这个Bug怎么修', content: '已经在实验室待了48小时了，谁来救救孩子。', views: 400, likes: 12, dislikes: 0, category: 'academic', timestamp: new Date(), bgColor: 'bg-indigo-50', rotation: -1.8,
        comments: [
            { id: 'c9', content: '什么bug？发出来看看', author: 'Debug专家', timestamp: new Date(), likes: 7 },
            { id: 'c10', content: '先睡觉，说不定睡醒就有思路了', author: '过来人', timestamp: new Date(), likes: 15 },
        ]
    },
    {
        id: '6', title: '北邮的夕阳好美', content: '今天下课路过主楼，拍到了绝美的晚霞。', views: 560, likes: 67, dislikes: 0, category: 'all', timestamp: new Date(), bgColor: 'bg-orange-50', rotation: 1.5,
        comments: [
            { id: 'c11', content: '求图！', author: '摄影爱好者', timestamp: new Date(), likes: 8 },
        ]
    },
];

export const WaterfallPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [posts, setPosts] = useState<PostWithComments[]>(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState({ title: '', content: '' });
  const [selectedPost, setSelectedPost] = useState<PostWithComments | null>(null);
  const [newComment, setNewComment] = useState('');
  const [composeCategory, setComposeCategory] = useState('rant');

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const handlePost = () => {
      if(!newPostContent.title || !newPostContent.content) return;
      const newPost: PostWithComments = {
          id: Date.now().toString(),
          title: newPostContent.title,
          content: newPostContent.content,
          views: 0,
          likes: 0,
          dislikes: 0,
          category: composeCategory,
          timestamp: new Date(),
          bgColor: 'bg-white',
          comments: [],
          rotation: getRandomRotation() // 为新帖子生成随机旋转角度
      };
      setPosts([newPost, ...posts]);
      setIsComposeOpen(false);
      setNewPostContent({ title: '', content: '' });
  };

  // 点赞帖子
  const handleLikePost = (postId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setPosts(posts.map(p =>
          p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
      if (selectedPost?.id === postId) {
          setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
      }
  };

  // 添加评论
  const handleAddComment = () => {
      if (!newComment.trim() || !selectedPost) return;
      const comment: Comment = {
          id: `c${Date.now()}`,
          content: newComment,
          author: '匿名用户',
          timestamp: new Date(),
          likes: 0
      };
      const updatedPost = {
          ...selectedPost,
          comments: [...(selectedPost.comments || []), comment]
      };
      setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
      setSelectedPost(updatedPost);
      setNewComment('');
  };

  // 点赞评论
  const handleLikeComment = (commentId: string) => {
      if (!selectedPost) return;
      const updatedComments = selectedPost.comments?.map(c =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      );
      const updatedPost = { ...selectedPost, comments: updatedComments };
      setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
      setSelectedPost(updatedPost);
  };

  return (
      <div className="h-full pt-10 px-4 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide relative">
          {/* Header */}
          <div className="text-center mb-2 relative z-10">
              <h2 className="text-3xl font-serif font-bold text-gray-800 tracking-wide italic">大声哔哔</h2>
          </div>

          {/* Categories Scatter Layout */}
          <div className="relative h-48 w-full mb-4 mx-auto max-w-sm">
              {CATEGORIES.map(cat => (
                  <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                          absolute px-5 py-2.5 rounded-[2rem] text-sm font-bold transition-all duration-300 shadow-sm border border-white/40
                          ${cat.position}
                          ${activeCategory === cat.id 
                              ? 'bg-gray-800 text-white z-20 scale-110 shadow-lg' 
                              : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white/80 hover:scale-105 z-10'}
                      `}
                  >
                      {cat.label}
                  </button>
              ))}
          </div>

          {/* Waterfall Grid (Columns) - 错落排列 */}
          <div className="columns-2 gap-4 space-y-4 pb-4">
              {filteredPosts.map(post => (
                  <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      style={{ transform: `rotate(${post.rotation || 0}deg)` }}
                      className={`break-inside-avoid rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] hover:rotate-0 ${post.bgColor || 'bg-white/60'}`}
                  >
                      <h3 className="font-bold text-gray-800 text-sm mb-2">{post.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4 font-light">{post.content}</p>

                      <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-1.5 py-0.5 bg-white/50 rounded text-[10px] text-gray-500 font-medium">
                              #{CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                          </span>
                      </div>

                      <div className="flex items-center gap-3 border-t border-black/5 pt-2 text-gray-400">
                          <div className="flex items-center gap-1">
                              <Eye size={10} /> <span className="text-[10px]">{post.views}</span>
                          </div>
                          <button
                              onClick={(e) => handleLikePost(post.id, e)}
                              className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                          >
                              <Heart size={10} /> <span className="text-[10px]">{post.likes}</span>
                          </button>
                          <div className="flex items-center gap-1">
                              <MessageCircle size={10} /> <span className="text-[10px]">{post.comments?.length || 0}</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Floating Action Button - Fixed to viewport */}
          <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto h-0 z-30 pointer-events-none">
              <div className="absolute bottom-24 right-6 pointer-events-auto">
                <button 
                    onClick={() => setIsComposeOpen(true)}
                    className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform shadow-gray-400/50"
                >
                    <Plus size={28} />
                </button>
              </div>
          </div>

          {/* Compose Modal - 半屏弹窗 */}
          {isComposeOpen && (
              <>
                  {/* 高斯模糊背景遮罩 */}
                  <div
                      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md animate-fade-in"
                      onClick={() => setIsComposeOpen(false)}
                  />
                  {/* 半屏弹窗 */}
                  <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
                      <div className="bg-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto max-h-[70vh] flex flex-col">
                          {/* 拖拽指示器 */}
                          <div className="flex justify-center pt-3 pb-2">
                              <div className="w-10 h-1 bg-gray-300 rounded-full" />
                          </div>

                          {/* 头部 */}
                          <div className="flex justify-between items-center px-6 pb-4">
                              <h3 className="text-lg font-bold text-gray-800">发布新内容</h3>
                              <button
                                  onClick={() => setIsComposeOpen(false)}
                                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                  <X size={18} />
                              </button>
                          </div>

                          {/* 内容区域 */}
                          <div className="flex-1 px-6 overflow-y-auto">
                              <input
                                  type="text"
                                  placeholder="标题"
                                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-base font-medium mb-3 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-400"
                                  value={newPostContent.title}
                                  onChange={e => setNewPostContent({...newPostContent, title: e.target.value})}
                              />

                              <textarea
                                  placeholder="在这里写下你的心事..."
                                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none placeholder-gray-400 font-light h-32"
                                  value={newPostContent.content}
                                  onChange={e => setNewPostContent({...newPostContent, content: e.target.value})}
                              />
                          </div>

                          {/* 底部操作区 */}
                          <div className="px-6 py-4 border-t border-gray-100">
                              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                      <button
                                          key={c.id}
                                          onClick={() => setComposeCategory(c.id)}
                                          className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                                              composeCategory === c.id
                                                  ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                          }`}
                                      >
                                          {c.label}
                                      </button>
                                  ))}
                              </div>
                              <button
                                  onClick={handlePost}
                                  disabled={!newPostContent.title || !newPostContent.content}
                                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  发布 <Send size={16} />
                              </button>
                          </div>
                      </div>
                  </div>
              </>
          )}

          {/* 帖子详情悬浮卡片 */}
          {selectedPost && (
              <>
                  {/* 高斯模糊背景遮罩 */}
                  <div
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
                      onClick={() => setSelectedPost(null)}
                  />
                  {/* 悬浮卡片 - 保持与原帖子相似的倾斜效果 */}
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
                      <div
                          style={{ transform: `rotate(${(selectedPost.rotation || 0) * 0.6}deg)` }}
                          className={`pointer-events-auto w-full max-w-sm max-h-[75vh] rounded-3xl shadow-2xl flex flex-col animate-scale-in overflow-hidden ${selectedPost.bgColor || 'bg-white'}`}
                      >
                          {/* 关闭按钮 */}
                          <button
                              onClick={() => setSelectedPost(null)}
                              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm z-10"
                          >
                              <X size={16} className="text-gray-600" />
                          </button>

                          {/* 帖子内容 */}
                          <div className="p-5 pb-3">
                              <span className="inline-block px-2 py-0.5 bg-white/60 rounded-full text-[10px] text-gray-500 font-medium mb-3">
                                  #{CATEGORIES.find(c => c.id === selectedPost.category)?.label || selectedPost.category}
                              </span>
                              <h3 className="font-bold text-gray-800 text-lg mb-2">{selectedPost.title}</h3>
                              <p className="text-sm text-gray-600 leading-relaxed font-light">{selectedPost.content}</p>

                              {/* 互动数据 */}
                              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/5">
                                  <div className="flex items-center gap-1 text-gray-400">
                                      <Eye size={14} /> <span className="text-xs">{selectedPost.views}</span>
                                  </div>
                                  <button
                                      onClick={() => handleLikePost(selectedPost.id)}
                                      className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors"
                                  >
                                      <Heart size={14} className="hover:fill-current" /> <span className="text-xs">{selectedPost.likes}</span>
                                  </button>
                                  <div className="flex items-center gap-1 text-gray-400">
                                      <MessageCircle size={14} /> <span className="text-xs">{selectedPost.comments?.length || 0}</span>
                                  </div>
                              </div>
                          </div>

                          {/* 评论区域 */}
                          <div className="flex-1 bg-white/60 backdrop-blur-sm overflow-hidden flex flex-col">
                              <div className="px-5 py-3 border-b border-gray-100">
                                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                      <MessageCircle size={14} />
                                      评论 ({selectedPost.comments?.length || 0})
                                  </h4>
                              </div>

                              {/* 评论列表 */}
                              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 max-h-40">
                                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                      selectedPost.comments.map(comment => (
                                          <div key={comment.id} className="bg-white/80 rounded-xl p-3">
                                              <div className="flex items-center justify-between mb-1">
                                                  <span className="text-xs font-medium text-gray-600">{comment.author}</span>
                                                  <button
                                                      onClick={() => handleLikeComment(comment.id)}
                                                      className="flex items-center gap-1 text-gray-400 hover:text-rose-400 transition-colors"
                                                  >
                                                      <Heart size={10} /> <span className="text-[10px]">{comment.likes}</span>
                                                  </button>
                                              </div>
                                              <p className="text-xs text-gray-500 leading-relaxed">{comment.content}</p>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="text-center py-6 text-gray-400">
                                          <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                                          <p className="text-xs">还没有评论，来说点什么吧</p>
                                      </div>
                                  )}
                              </div>

                              {/* 评论输入框 */}
                              <div className="px-5 py-3 bg-white border-t border-gray-100">
                                  <div className="flex gap-2">
                                      <input
                                          type="text"
                                          placeholder="写下你的评论..."
                                          className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-400"
                                          value={newComment}
                                          onChange={e => setNewComment(e.target.value)}
                                          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                      />
                                      <button
                                          onClick={handleAddComment}
                                          disabled={!newComment.trim()}
                                          className="p-2 bg-gray-900 text-white rounded-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                          <Send size={16} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </>
          )}
      </div>
  );
};
