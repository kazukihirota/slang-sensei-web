-- Seed data for Japanese slang terms
-- This file contains popular Japanese slang with examples

-- Insert slang entries
INSERT INTO slang (id, headword, reading, pos, register, dialect, tags, definition_ja, definition_en, polite_equiv, notes, popularity) VALUES
-- Internet/Gen Z slang
('550e8400-e29b-41d4-a716-446655440001', '草', 'くさ', 'interj', 'casual', ARRAY['internet'], ARRAY['internet', 'youth', 'gaming'], '笑いを表すネットスラング。「笑い」が「w」で表現され、それが草に見えることから。', 'Internet slang for "lol" or laughter. Comes from the letter "w" (for "warai"/laugh) looking like grass when repeated.', '面白い、笑える', 'Extremely common online. Can be stacked (草草草) for emphasis.', 95),

('550e8400-e29b-41d4-a716-446655440002', 'エモい', 'えもい', 'adj', 'casual', ARRAY['internet'], ARRAY['youth', 'internet', 'emotion'], '感情的で心に響く、ノスタルジックな気持ちを表す形容詞。英語の「emotional」から。', 'Adjective meaning emotionally moving, nostalgic, or touching. Derived from English "emotional".', '感動的な、心に響く', 'Very popular among young people. Can describe music, photos, memories, etc.', 85),

('550e8400-e29b-41d4-a716-446655440003', 'しか勝たん', 'しかかたん', 'phrase', 'casual', ARRAY['internet'], ARRAY['internet', 'youth', 'idol'], '「～しか勝たない」の略。そのものが最高で他に比べるものがないという意味。', 'Abbreviation of "～しか勝たない" meaning "only ~ can win" or "~ is the best, nothing else compares".', '最高です、他に比べるものがない', 'Popular in idol/anime fan communities. Often used with names or things you love most.', 75),

('550e8400-e29b-41d4-a716-446655440004', 'ガチ', 'がち', 'adv', 'casual', ARRAY['youth'], ARRAY['youth', 'emphasis'], '本気、真剣、本当にという意味の強調語。', 'Intensifier meaning "seriously", "really", "for real", or "legitimately".', '本当に、真剣に', 'Very common among young people. Used to emphasize sincerity or intensity.', 90),

('550e8400-e29b-41d4-a716-446655440005', 'やばい', 'やばい', 'adj', 'casual', ARRAY['standard'], ARRAY['youth', 'versatile'], '元々は危険を表していたが、現在は「すごい」「素晴らしい」の意味でも使われる。', 'Originally meant "dangerous" or "bad", but now commonly used to mean "amazing", "awesome", or "incredible".', '素晴らしい、すごい（文脈による）', 'Extremely versatile. Can be positive or negative depending on context and tone.', 98),

-- Traditional/Regional slang
('550e8400-e29b-41d4-a716-446655440006', 'なんでやねん', 'なんでやねん', 'interj', 'casual', ARRAY['kansai'], ARRAY['kansai', 'comedy', 'tsukkomi'], '関西弁で「なぜなんだ」「どうして」という意味。ツッコミでよく使われる。', 'Kansai dialect expression meaning "why?" or "what the heck?". Commonly used in tsukkomi (straight man) comedy.', 'どうしてですか', 'Essential Kansai dialect phrase. Often used in comedic contexts.', 70),

('550e8400-e29b-41d4-a716-446655440007', 'せやな', 'せやな', 'interj', 'casual', ARRAY['kansai'], ARRAY['kansai', 'agreement'], '関西弁で「そうだね」「その通りだ」という意味。', 'Kansai dialect for "that''s right", "yeah", or "exactly".', 'そうですね', 'Casual agreement expression popular in Kansai region.', 65),

-- Anime/Otaku culture
('550e8400-e29b-41d4-a716-446655440008', 'オタク', 'おたく', 'noun', 'neutral', ARRAY['standard'], ARRAY['otaku', 'anime', 'subculture'], '特定の分野に強い興味を持つ人。アニメ、ゲーム、アイドルなど。', 'Person with intense interest in a particular field, especially anime, games, or idols.', '愛好家、ファン', 'Originally somewhat negative, but now more neutral or even positive in some contexts.', 80),

('550e8400-e29b-41d4-a716-446655440009', '推し', 'おし', 'noun', 'casual', ARRAY['internet'], ARRAY['idol', 'anime', 'fandom'], '応援している人やキャラクター。アイドルやアニメキャラなど。', 'Your favorite person or character that you support, especially idols or anime characters.', 'お気に入り、応援している人', 'Very popular in idol and anime fandoms. Can be used as a verb too (推す).', 85),

('550e8400-e29b-41d4-a716-446655440010', 'ワンチャン', 'わんちゃん', 'adv', 'casual', ARRAY['youth'], ARRAY['youth', 'possibility'], '「ワンチャンス」の略。「もしかしたら」「可能性がある」という意味。', 'Abbreviation of "one chance". Means "maybe", "possibly", or "there''s a chance".', 'もしかしたら、可能性がある', 'Popular among young people when discussing possibilities or hopes.', 70),

-- Food/Daily life
('550e8400-e29b-41d4-a716-446655440011', '飯テロ', 'めしてろ', 'noun', 'casual', ARRAY['internet'], ARRAY['internet', 'food'], '美味しそうな食べ物の写真や動画で、見る人の食欲を刺激すること。', 'Showing delicious-looking food photos/videos that stimulate others'' appetite, especially when they can''t eat.', '食欲をそそる投稿', 'Common on social media. Combination of 飯 (meal) and テロ (terrorism).', 75),

('550e8400-e29b-41d4-a716-446655440012', 'リアタイ', 'りあたい', 'noun', 'casual', ARRAY['internet'], ARRAY['internet', 'tv', 'streaming'], '「リアルタイム」の略。放送と同時に視聴すること。', 'Abbreviation of "real time". Watching TV shows or streams as they air live.', 'リアルタイム視聴', 'Popular when discussing TV shows, anime, or live streams.', 60),

-- Positive expressions
('550e8400-e29b-41d4-a716-446655440013', '神', 'かみ', 'noun', 'casual', ARRAY['youth'], ARRAY['youth', 'praise', 'gaming'], '素晴らしい、最高という意味。元々は神様だが、最高級の褒め言葉として使われる。', 'Originally means "god", but used as the ultimate praise meaning "godlike", "amazing", or "perfect".', '素晴らしい、完璧', 'Ultimate compliment. Often used for skills, food, entertainment, etc.', 80),

('550e8400-e29b-41d4-a716-446655440014', 'イケる', 'いける', 'verb', 'casual', ARRAY['youth'], ARRAY['youth', 'approval'], '大丈夫、良い、いいね、という意味。「行ける」から転じて。', 'Means "it''s good", "okay", "acceptable". Derived from the verb "to go" (行ける).', '大丈夫です、良いです', 'Versatile positive expression. Can refer to taste, plans, situations, etc.', 75),

('550e8400-e29b-41d4-a716-446655440015', 'アリ', 'あり', 'noun', 'casual', ARRAY['youth'], ARRAY['youth', 'approval'], '「有り」から。選択肢として受け入れられる、良いという意味。', 'From "有り" (exists/available). Means something is acceptable, good, or worth considering as an option.', '受け入れられる、良い選択', 'Often used when evaluating options or giving approval. Opposite of ナシ.', 70);

-- Insert example sentences
INSERT INTO slang_example (id, slang_id, jp, en, source) VALUES
-- 草 examples
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'その動画見て草生えた', 'I watched that video and burst out laughing', 'social_media'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '草ァ！めっちゃ面白いじゃん', 'Lol! That''s really funny!', 'chat'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '草不可避', 'Impossible not to laugh', 'internet_meme'),

-- エモい examples
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'この曲エモすぎて泣きそう', 'This song is so emotional I might cry', 'music_review'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '夕焼けの写真がエモい', 'This sunset photo is so moving', 'instagram'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '学校の思い出がエモすぎる', 'School memories are so nostalgic', 'conversation'),

-- しか勝たん examples
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '推ししか勝たん', 'My fave is the absolute best', 'fan_community'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'チョコミントしか勝たん', 'Chocolate mint is the best, nothing else compares', 'food_discussion'),

-- ガチ examples
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'ガチで美味しい', 'This is seriously delicious', 'food_review'),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'ガチ勢だから詳しいよ', 'I''m a serious fan so I know the details', 'gaming_community'),
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', 'ガチでヤバい', 'This is seriously crazy/amazing', 'conversation'),

-- やばい examples
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 'この料理やばい！', 'This food is amazing!', 'restaurant_review'),
('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'テストの結果やばいかも', 'My test results might be bad', 'student_chat'),
('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'やばい、遅刻する！', 'Oh no, I''m going to be late!', 'daily_conversation'),

-- なんでやねん examples
('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440006', 'なんでやねん、そんなアホな！', 'What the heck, that''s ridiculous!', 'kansai_comedy'),
('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440006', 'え、なんでやねん', 'Huh? Why though?', 'casual_conversation'),

-- せやな examples
('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440007', 'せやな、そう思うわ', 'Yeah, I think so too', 'kansai_conversation'),
('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440007', 'せやな、確かに', 'That''s right, for sure', 'agreement'),

-- オタク examples
('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440008', 'アニメオタクです', 'I''m an anime otaku', 'self_introduction'),
('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440008', 'オタク文化が好き', 'I like otaku culture', 'hobby_discussion'),

-- 推し examples
('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440009', '推しのライブに行く', 'Going to my fave''s concert', 'idol_fan'),
('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440009', '推しが可愛すぎる', 'My fave is too cute', 'fan_comment'),
('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440009', '推し活に忙しい', 'Busy with fan activities', 'lifestyle'),

-- ワンチャン examples
('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440010', 'ワンチャン合格するかも', 'Maybe I''ll pass', 'exam_talk'),
('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440010', 'ワンチャン行けるよ', 'There''s a chance I can go', 'making_plans'),

-- 飯テロ examples
('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440011', 'この写真飯テロすぎる', 'This photo is such food terrorism', 'social_media'),
('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440011', '深夜の飯テロやめて', 'Stop the late-night food terrorism', 'twitter_comment'),

-- リアタイ examples
('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440012', 'アニメをリアタイで見る', 'Watching anime in real time', 'anime_discussion'),
('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440012', 'リアタイ勢集合', 'Real-time viewers assemble', 'live_streaming'),

-- 神 examples
('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440013', 'このゲーム神ゲー', 'This game is godlike', 'gaming_review'),
('650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440013', '神対応ありがとう', 'Thanks for the amazing service', 'customer_service'),
('650e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440013', '神すぎて語彙力失う', 'So amazing I lose my vocabulary', 'praise'),

-- イケる examples
('650e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440014', 'この味イケる', 'This taste is good', 'food_tasting'),
('650e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440014', 'そのプランイケるね', 'That plan sounds good', 'planning_discussion'),

-- アリ examples
('650e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440015', 'その案アリだね', 'That idea is good', 'brainstorming'),
('650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440015', '全然アリ！', 'Totally acceptable!', 'approval');
