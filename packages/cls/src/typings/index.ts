import { Method } from 'got';

export interface AnyObject {
  [prop: string]: any;
}

export interface ClsOptions {
  region: string; // request region, default: ap-guangzhou
  secretId: string; // tencent account secret id
  secretKey: string; // tencent account secret key
  token?: string; // tencent account token
  debug?: boolean; // whether enable log debug info
  timeout?: number; // request timeout in miliseconds
  expire?: number;
}

export interface RequestOptions {
  debug?: boolean; // whether enable log debug info
  path: string; // request path
  method: Method; // request method
  query?: AnyObject;
  data?: AnyObject;
  headers?: AnyObject;
  options?: ClsOptions;
}

export interface ApiError {
  message: string;
}

export interface ApiResponse {
  error?: ApiError;
  [prop: string]: any;
}

export interface TopicExtractRule {
  // 时间字段的 key 名字，time_key 和 time_format 必须成对出现
  time_key?: string;
  // 时间字段的格式，参考 C 语言的strftime函数对于时间的格式说明
  time_format?: string;
  // 分隔符类型日志的分隔符，只有log_type为delimiter_log时有效
  delimiter?: string;
  // 整条日志匹配规则，只有log_type为fullregex_log时有效
  log_regex?: string;
  // 行首匹配规则，只有log_type为multiline_log时有效
  beginning_regex?: string;
  // 提取的每个字段的 key 名字，为空的 key 代表丢弃这个字段，只有log_type为delimiter_log时有效，json_log的日志使用 json 本身的 key
  keys?: string[];
  // 需要过滤日志的 key，最多5个
  filter_keys?: string[];
  // 上述字段 filter_keys 对应的值，个数与 filter_keys 相同，一一对应，采集匹配的日志
  filter_regex?: string[];
}

export interface CreateTopicData {
  // 日志主题归属的日志集的 ID
  logset_id: string;
  // 日志主题的名字
  topic_name: string;
  // 主题分区 partition个数，不传参默认创建1个，最大创建允许10个，分裂/合并操作会改变分区数量，整体上限50个
  partition_count?: number;
  // 旧版日志主题需要采集的日志路径，不采集无需设置
  path?: string;
  // 新版通配符日志采集路径，以/**/分隔文件目录和文件名，和旧版path只会存在一个
  wild_path?: string;
  // 采集的日志类型，json_log代表 json 格式日志，delimiter_log代表分隔符格式日志，minimalist_log代表单行全文格式，multiline_log代表多行日志，fullregex_log代表完整正则，默认为minimalist_log
  log_type?: string;
  // JsonObject  提取规则，如果设置了 extract_rule，则必须设置 log_type
  extract_rule?: TopicExtractRule;
}

export interface UpdateTopicData extends CreateTopicData {
  topic_id: string;
}

export interface IndexFullTextRule {
  // 是否大小写敏感
  case_sensitive: boolean;
  // 全文索引的分词符，不允许为空，建议设置为!@#%^&*()-_="', <>/?|\;:\n\t\r[]{}
  tokenizer?: string;
}
export interface IndexKeyValueRule {
  // bool  是  是否大小写敏感
  case_sensitive: boolean;
  // 需要建索引的 key 的名字
  keys: string[];
  // 需要建索引 的 key 对应的类型，一一对应，目前支持long double text
  types: string[];
  // 上面 key 对应的分词符，一一对应，只对text类型设置，其他类型为空字符串
  tokenizers?: string[];
}
export interface IndexRule {
  // 全文索引的相关配置
  full_text?: IndexFullTextRule;
  // kv 索引的相关配置
  key_value?: IndexKeyValueRule;
}

export interface UpdateIndexData {
  // 修改的 index 属于的 topic ID
  topic_id: string;
  // index 的开关状态
  effective: boolean;
  // 索引规则，当 effective 为 true 时必需
  rule?: IndexRule;
}
