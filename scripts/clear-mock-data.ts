import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 加载 .env.local 文件
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 固定用户 ID（开发阶段使用）
const DEMO_USER_ID = 'demo_user';

async function clearData() {
  console.log('🧹 开始清空模拟数据...');

  try {
    // 清空 chat_messages（会话消息）
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录

    if (messagesError) {
      console.error('清空聊天消息失败:', messagesError);
    } else {
      console.log('✅ 聊天消息已清空');
    }

    // 清空 chat_sessions（聊天会话）
    const { error: sessionsError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('user_id', DEMO_USER_ID);

    if (sessionsError) {
      console.error('清空聊天会话失败:', sessionsError);
    } else {
      console.log('✅ 聊天会话已清空');
    }

    // 清空 journals（日记）
    const { error: journalsError } = await supabase
      .from('journals')
      .delete()
      .eq('user_id', DEMO_USER_ID);

    if (journalsError) {
      console.error('清空日记失败:', journalsError);
    } else {
      console.log('✅ 日记数据已清空');
    }

    console.log('🎉 所有模拟数据已清空！');
  } catch (error) {
    console.error('清空数据时发生错误:', error);
  }
}

// 运行主函数
clearData().catch(console.error);
