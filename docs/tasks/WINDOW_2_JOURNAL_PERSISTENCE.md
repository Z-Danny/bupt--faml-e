# 窗口2任务：日记持久化功能

> **分支**：`feature/journal-persistence`
> **优先级**：P1（依赖窗口1完成）
> **预计时间**：6-8小时
> **角色**：Claude Code独立开发

---

## 🎯 任务目标

1. 创建Supabase客户端
2. 实现日记CRUD API
3. 实现图片上传功能
4. 实现音频上传功能
5. 修改JournalModal组件
6. 修改Calendar组件

---

## ⚠️ 开始前检查

**必须等待窗口1完成以下任务**：
- [ ] Supabase项目已创建
- [ ] 数据库表 `journals` 已创建
- [ ] Storage buckets `journal-images` 和 `journal-audio` 已创建
- [ ] `.env.local` 文件已配置
- [ ] 存在 `WINDOW_1_DONE.txt` 文件

**如果窗口1未完成，请等待！**

---

## 📋 任务清单

### 阶段1：创建Supabase客户端（30分钟）

#### 1.1 创建 `src/lib/supabaseClient.ts`

**要求**：
```typescript
// 功能：
// 1. 从环境变量读取SUPABASE_URL和SUPABASE_ANON_KEY
// 2. 创建并导出Supabase客户端实例
// 3. 添加类型定义

// 参考：
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### 1.2 创建用户ID管理工具

**要求**：
在 `src/lib/supabaseClient.ts` 中添加：
```typescript
// 功能：
// 1. 从localStorage获取或生成用户ID
// 2. 格式：user_${timestamp}_${random}
// 3. 导出getUserId函数

export const getUserId = (): string => {
  let userId = localStorage.getItem('famlee_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('famlee_user_id', userId);
  }
  return userId;
};
```

---

### 阶段2：实现日记API（2小时）

#### 2.1 创建 `src/services/supabaseService.ts`

**要求**：
实现以下函数：

##### 2.1.1 上传图片到Storage
```typescript
/**
 * 上传图片到Supabase Storage
 * @param imageBase64 - base64编码的图片数据
 * @returns 图片的公开URL
 */
export const uploadImage = async (imageBase64: string): Promise<string> => {
  // 1. 将base64转换为Blob
  // 2. 生成唯一文件名：image_${timestamp}_${random}.jpg
  // 3. 上传到journal-images bucket
  // 4. 返回公开URL
};
```

##### 2.1.2 上传音频到Storage
```typescript
/**
 * 上传音频到Supabase Storage
 * @param audioBlob - 音频Blob对象
 * @returns 音频的公开URL
 */
export const uploadAudio = async (audioBlob: Blob): Promise<string> => {
  // 1. 生成唯一文件名：audio_${timestamp}_${random}.webm
  // 2. 上传到journal-audio bucket
  // 3. 返回公开URL
};
```

##### 2.1.3 保存日记
```typescript
/**
 * 保存日记到数据库
 * @param entry - 日记条目对象
 * @returns 保存后的日记对象（包含id和created_at）
 */
export const saveJournal = async (entry: {
  content: string;
  summary?: string;
  mood: string;
  images?: string[];  // base64数组
  audioBlob?: Blob;
}): Promise<JournalEntry> => {
  // 1. 获取用户ID
  // 2. 上传图片（如果有）
  // 3. 上传音频（如果有）
  // 4. 插入到journals表
  // 5. 返回完整的日记对象
};
```

##### 2.1.4 获取日记列表
```typescript
/**
 * 获取用户的所有日记
 * @returns 日记数组，按创建时间倒序
 */
export const getJournals = async (): Promise<JournalEntry[]> => {
  // 1. 获取用户ID
  // 2. 查询journals表
  // 3. 按created_at降序排序
  // 4. 返回日记数组
};
```

##### 2.1.5 获取单条日记
```typescript
/**
 * 根据ID获取日记详情
 * @param id - 日记ID
 * @returns 日记对象
 */
export const getJournalById = async (id: string): Promise<JournalEntry | null> => {
  // 1. 查询journals表
  // 2. 验证user_id匹配
  // 3. 返回日记对象
};
```

---

### 阶段3：修改JournalModal组件（2小时）

#### 3.1 修改 `src/components/JournalModal.tsx`

**当前行为**：
- 用户填写日记内容
- 选择心情
- 可选上传图片和音频
- 点击保存后，调用 `onSaveEntry` 回调，传递数据给父组件
- 父组件（App.tsx）将数据存储在内存中

**目标行为**：
- 保持UI和交互完全不变
- 点击保存后，调用 `saveJournal` API
- 显示加载状态
- 保存成功后关闭模态框
- 保存失败显示错误提示

**修改要点**：

##### 3.1.1 导入依赖
```typescript
import { saveJournal } from '../services/supabaseService';
```

##### 3.1.2 添加状态管理
```typescript
const [isSaving, setIsSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
```

##### 3.1.3 修改保存逻辑
找到保存按钮的点击处理函数，修改为：
```typescript
const handleSave = async () => {
  try {
    setIsSaving(true);
    setError(null);

    // 调用Supabase API保存日记
    const savedEntry = await saveJournal({
      content: journalContent,
      summary: aiSummary,  // 如果有AI总结
      mood: selectedMood,
      images: uploadedImages,  // base64数组
      audioBlob: recordedAudio,  // Blob对象
    });

    // 保存成功，通知父组件（可选）
    onSaveEntry?.(savedEntry);

    // 关闭模态框
    onClose();
  } catch (err) {
    console.error('保存日记失败:', err);
    setError('保存失败，请重试');
  } finally {
    setIsSaving(false);
  }
};
```

##### 3.1.4 更新UI
- 保存按钮显示加载状态：`{isSaving ? '保存中...' : '保存'}`
- 保存时禁用按钮：`disabled={isSaving}`
- 显示错误信息（如果有）

**注意**：
- 不要修改UI布局和样式
- 不要修改心情选择、图片上传、音频录制的逻辑
- 只修改保存按钮的点击处理

---

### 阶段4：修改Calendar组件（1.5小时）

#### 4.1 修改 `src/pages/Calendar.tsx`

**当前行为**：
- 从父组件（App.tsx）接收 `journalEntries` prop
- 显示日记列表
- 点击日记查看详情

**目标行为**：
- 不再依赖prop，直接从Supabase加载数据
- 页面加载时自动获取日记列表
- 显示加载状态
- 处理空状态和错误状态

**修改要点**：

##### 4.1.1 导入依赖
```typescript
import { useEffect, useState } from 'react';
import { getJournals } from '../services/supabaseService';
import type { JournalEntry } from '../types';
```

##### 4.1.2 添加状态管理
```typescript
const [journals, setJournals] = useState<JournalEntry[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

##### 4.1.3 加载数据
```typescript
useEffect(() => {
  const loadJournals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getJournals();
      setJournals(data);
    } catch (err) {
      console.error('加载日记失败:', err);
      setError('加载失败，请刷新重试');
    } finally {
      setIsLoading(false);
    }
  };

  loadJournals();
}, []);
```

##### 4.1.4 更新渲染逻辑
- 加载中显示：骨架屏或加载动画
- 空状态显示：提示用户创建第一篇日记
- 错误状态显示：错误信息和重试按钮
- 正常状态：显示日记列表（使用 `journals` 而非 `journalEntries` prop）

**注意**：
- 不要修改日记卡片的UI
- 不要修改日历视图的布局
- 保持现有的交互逻辑

---

### 阶段5：修改App.tsx（30分钟）

#### 5.1 修改 `src/App.tsx`

**当前行为**：
- 使用 `generateMockEntries()` 生成模拟数据
- 将 `journalEntries` 作为prop传递给Calendar组件

**目标行为**：
- 移除 `generateMockEntries()` 调用
- 移除 `journalEntries` 状态
- 不再向Calendar组件传递prop

**修改要点**：

##### 5.1.1 移除模拟数据
找到并删除：
```typescript
// 删除这行
const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(generateMockEntries());

// 删除generateMockEntries函数调用
```

##### 5.1.2 更新Calendar组件调用
找到Calendar组件的渲染位置，修改为：
```typescript
// 修改前
<CalendarPage journalEntries={journalEntries} />

// 修改后
<CalendarPage />
```

##### 5.1.3 更新JournalModal回调（可选）
如果需要在保存后刷新Calendar页面，可以添加：
```typescript
const handleJournalSaved = (entry: JournalEntry) => {
  // 可以在这里添加全局通知或刷新逻辑
  console.log('日记已保存:', entry);
};
```

---

### 阶段6：类型定义更新（30分钟）

#### 6.1 检查 `src/types.ts`

**要求**：
确保 `JournalEntry` 接口包含以下字段：
```typescript
export interface JournalEntry {
  id: string;           // UUID
  user_id?: string;     // 用户ID（可选，前端不需要）
  content: string;      // 日记内容
  summary?: string;     // AI总结
  mood: MoodType;       // 心情
  images?: string[];    // 图片URL数组
  audio_url?: string;   // 音频URL
  created_at: string;   // ISO 8601格式的时间戳
}
```

**如果字段不匹配，需要更新类型定义。**

---

### 阶段7：测试（1小时）

#### 7.1 本地测试清单

- [ ] **测试1：创建日记（仅文本）**
  - 打开应用
  - 点击创建日记
  - 输入内容，选择心情
  - 点击保存
  - 验证：保存成功，模态框关闭

- [ ] **测试2：创建日记（带图片）**
  - 创建日记
  - 上传1-2张图片
  - 点击保存
  - 验证：图片上传成功，日记保存成功

- [ ] **测试3：创建日记（带音频）**
  - 创建日记
  - 录制音频
  - 点击保存
  - 验证：音频上传成功，日记保存成功

- [ ] **测试4：查看日记列表**
  - 切换到Calendar页面
  - 验证：显示所有已保存的日记
  - 验证：日记按时间倒序排列

- [ ] **测试5：查看日记详情**
  - 点击某条日记
  - 验证：显示完整内容、图片、音频

- [ ] **测试6：空状态**
  - 清空localStorage（`localStorage.clear()`）
  - 刷新页面
  - 切换到Calendar页面
  - 验证：显示空状态提示

- [ ] **测试7：错误处理**
  - 断开网络
  - 尝试保存日记
  - 验证：显示错误提示

#### 7.2 Supabase Dashboard验证

- [ ] 打开Supabase Dashboard
- [ ] 进入Table Editor → journals表
- [ ] 验证：可以看到新创建的日记记录
- [ ] 进入Storage → journal-images
- [ ] 验证：可以看到上传的图片文件
- [ ] 进入Storage → journal-audio
- [ ] 验证：可以看到上传的音频文件

---

## ✅ 完成标志

当以下所有项都完成时，窗口2任务完成：

- [ ] `src/lib/supabaseClient.ts` 已创建
- [ ] `src/services/supabaseService.ts` 已创建（日记部分）
- [ ] `src/components/JournalModal.tsx` 已修改
- [ ] `src/pages/Calendar.tsx` 已修改
- [ ] `src/App.tsx` 已修改
- [ ] 所有测试通过
- [ ] 代码已提交到 `feature/journal-persistence` 分支

---

## 📢 完成后通知

在项目根目录创建 `WINDOW_2_DONE.txt` 文件，内容如下：

```
✅ 窗口2已完成日记持久化功能

📋 产出物：
- src/lib/supabaseClient.ts
- src/services/supabaseService.ts（日记API）
- 修改后的 src/components/JournalModal.tsx
- 修改后的 src/pages/Calendar.tsx
- 修改后的 src/App.tsx

✅ 功能验证：
- 日记创建功能正常
- 图片上传功能正常
- 音频上传功能正常
- 日记列表加载正常
- 日记详情查看正常

📢 窗口4可以开始集成日记部分了！

📝 注意事项：
- supabaseClient.ts 已创建，窗口3和4可以直接导入使用
- getUserId() 函数可供其他模块使用
```

---

## 🐛 常见问题

### Q1: 图片上传失败，返回403错误
**A**: 检查Storage bucket的访问策略，确保已设置为公开读取。

### Q2: 保存日记时提示"Missing Supabase environment variables"
**A**: 检查 `.env.local` 文件是否存在，环境变量是否正确配置。重启开发服务器。

### Q3: 日记列表为空，但数据库中有数据
**A**: 检查 `user_id` 是否匹配。可能是localStorage被清空，生成了新的用户ID。

### Q4: 音频上传后无法播放
**A**: 检查音频文件的MIME类型是否正确（应该是 `audio/webm` 或 `audio/mp4`）。

### Q5: Calendar页面一直显示加载状态
**A**: 检查 `getJournals()` 函数是否有错误。打开浏览器控制台查看错误信息。

---

## 📚 参考资料

- [Supabase JavaScript客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Storage文档](https://supabase.com/docs/guides/storage)
- [React Hooks文档](https://react.dev/reference/react)

---

## 🔄 下一步

完成本窗口任务后：
1. 提交代码到 `feature/journal-persistence` 分支
2. 推送到远程仓库
3. 创建 `WINDOW_2_DONE.txt` 通知文件
4. 等待窗口3完成
5. 准备协助窗口4进行集成测试

---

**准备好了吗？开始开发日记持久化功能吧！🚀**
