<?php

namespace Database\Seeders;

use App\Enums\JoinRequestStatus;
use App\Enums\MemberRole;
use App\Enums\StudyGroupStatus;
use App\Models\JoinRequest;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudyGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $budi = User::where('email', 'budi@ui.ac.id')->first();
        $siti = User::where('email', 'siti@its.ac.id')->first();
        $rian = User::where('email', 'rian@ugm.ac.id')->first();
        $ayu = User::where('email', 'ayu@itb.ac.id')->first();
        $fikri = User::where('email', 'fikri@unair.ac.id')->first();
        $dewi = User::where('email', 'dewi@ub.ac.id')->first();
        $eko = User::where('email', 'eko@telkomuniversity.ac.id')->first();
        $nabila = User::where('email', 'nabila@binus.ac.id')->first();

        if (!$budi || !$siti) {
            return;
        }

        $groupsData = [
            [
                'owner' => $budi,
                'title' => 'Belajar Algoritma & Struktur Data Lanjut',
                'description' => 'Fokus diskusi persiapan Ujian Tengah Semester & bedah soal Graph, Dynamic Programming, dan Tree Traversal. Terbuka untuk semua angkatan!',
                'location' => 'Perpustakaan UI Depok / Online Zoom',
                'meeting_time' => now()->addDays(2)->setHour(14)->setMinute(0),
                'expires_at' => now()->addDays(3),
                'max_members' => 6,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/BudiAlgoUiGroupDemo',
                'tag_name' => 'Algorithms',
                'joined_members' => [$siti, $ayu],
                'pending_requests' => [$rian, $eko],
            ],
            [
                'owner' => $siti,
                'title' => 'Kelompok Belajar Web Dev - React 19 & Laravel 12',
                'description' => 'Fullstack Javascript & PHP dev sprint! Membahas TanStack Query, REST API, Reverb WebSockets, dan Clean Architecture.',
                'location' => 'Lab Komputer Departemen Sistem Informasi ITS',
                'meeting_time' => now()->addDays(3)->setHour(10)->setMinute(0),
                'expires_at' => now()->addDays(4),
                'max_members' => 8,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/SitiWebDevItsGroup',
                'tag_name' => 'Web Development',
                'joined_members' => [$eko, $budi],
                'pending_requests' => [$fikri],
            ],
            [
                'owner' => $fikri,
                'title' => 'Machine Learning & Python Data Science Basics',
                'description' => 'Belajar bareng Pandas, NumPy, Scikit-Learn, dan exploratory data analysis (EDA). Cocok buat yang baru mau mulai AI/ML.',
                'location' => 'Perpustakaan Kampus C UNAIR Surabaya',
                'meeting_time' => now()->addDays(4)->setHour(15)->setMinute(30),
                'expires_at' => now()->addDays(5),
                'max_members' => 5,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/FikriDataScienceUnair',
                'tag_name' => 'Machine Learning',
                'joined_members' => [$rian],
                'pending_requests' => [$nabila],
            ],
            [
                'owner' => $dewi,
                'title' => 'UI/UX Figma Design Sprint & Prototyping',
                'description' => 'Sesi hands-on membuat wireframe, design system neo-brutalism, dan interactive prototype aplikasi mobile.',
                'location' => 'Co-Working Space Malang / Online Figma',
                'meeting_time' => now()->addDays(1)->setHour(13)->setMinute(0),
                'expires_at' => now()->addDays(2),
                'max_members' => 6,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/DewiUiUxDesignUb',
                'tag_name' => 'UI/UX',
                'joined_members' => [$siti],
                'pending_requests' => [$budi],
            ],
            [
                'owner' => $ayu,
                'title' => 'Bedah Soal Competitive Programming Codeforces',
                'description' => 'Latihan rutin solving problem Div 2/Div 3 Codeforces & Gemastik. Saling share solusi dan efisiensi waktu algoritma.',
                'location' => 'Lab Teori Gedung Benny Subianto ITB Bandung',
                'meeting_time' => now()->addDays(5)->setHour(16)->setMinute(0),
                'expires_at' => now()->addDays(6),
                'max_members' => 10,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/AyuCompetitiveProgItb',
                'tag_name' => 'Competitive Programming',
                'joined_members' => [$budi, $eko],
                'pending_requests' => [],
            ],
            [
                'owner' => $nabila,
                'title' => 'Cyber Security & Ethical Hacking Basics',
                'description' => 'Diskusi Capture The Flag (CTF), web penetration testing, network packet analysis pakai Wireshark dan Burp Suite.',
                'location' => 'Online Discord & Google Meet',
                'meeting_time' => now()->addDays(3)->setHour(19)->setMinute(0),
                'expires_at' => now()->addDays(4),
                'max_members' => 5,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/NabilaCyberSecBinus',
                'tag_name' => 'Cyber Security',
                'joined_members' => [$ayu],
                'pending_requests' => [$siti],
            ],
            [
                'owner' => $rian,
                'title' => 'Database Design & SQL Optimization Masterclass',
                'description' => 'Membahas perancangan ERD, Indexing, Query Optimization, dan Transaksi Database untuk aplikasi skala besar.',
                'location' => 'Perpustakaan Fakultas Teknik UGM Yogyakarta',
                'meeting_time' => now()->addDays(2)->setHour(11)->setMinute(0),
                'expires_at' => now()->addDays(3),
                'max_members' => 6,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/RianSqlMasterclassUgm',
                'tag_name' => 'Database',
                'joined_members' => [$fikri],
                'pending_requests' => [$dewi],
            ],
            [
                'owner' => $dewi,
                'title' => 'Diskusi Kasus Hukum Perdata & Pidana',
                'description' => 'Sesi belajar bersama untuk persiapan ujian akhir semester Hukum Perdata. Telah selesai dilaksanakan minggu lalu.',
                'location' => 'Fakultas Hukum UB Malang',
                'meeting_time' => now()->subDays(5)->setHour(10)->setMinute(0),
                'expires_at' => now()->subDays(4),
                'max_members' => 15,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/DewiHukumUb',
                'tag_name' => 'Law & Politics',
                'joined_members' => [$budi, $ayu],
                'pending_requests' => [],
            ],
            [
                'owner' => $fikri,
                'title' => 'Bedah Jurnal Kedokteran Tropis',
                'description' => 'Membahas jurnal terbaru tentang penyakit tropis. Sesi ini sudah selesai, terima kasih bagi yang sudah hadir!',
                'location' => 'Gedung FK UNAIR / Online Zoom',
                'meeting_time' => now()->subDays(2)->setHour(19)->setMinute(0),
                'expires_at' => now()->subDays(1),
                'max_members' => 20,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/FikriMedUnair',
                'tag_name' => 'Medical & Health Sciences',
                'joined_members' => [$siti, $rian, $nabila],
                'pending_requests' => [],
            ],
            [
                'owner' => $eko,
                'title' => 'Studi Kelayakan Bisnis Start-Up',
                'description' => 'Membuat proyeksi finansial dan business model canvas untuk start-up teknologi. Mari brainstorming bersama!',
                'location' => 'Telkom University Coffee Shop',
                'meeting_time' => now()->addDays(4)->setHour(16)->setMinute(30),
                'expires_at' => now()->addDays(5),
                'max_members' => 8,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/EkoBisnisTelkom',
                'tag_name' => 'Business & Management',
                'joined_members' => [$dewi],
                'pending_requests' => [$budi],
            ],
            [
                'owner' => $nabila,
                'title' => 'Diskusi Kesehatan Mental di Era Digital',
                'description' => 'Menganalisis dampak sosial media terhadap psikologi remaja. Terbuka untuk diskusi santai.',
                'location' => 'Online Google Meet',
                'meeting_time' => now()->addDays(1)->setHour(20)->setMinute(0),
                'expires_at' => now()->addDays(2),
                'max_members' => 12,
                'visibility' => 'public',
                'whatsapp_link' => 'https://chat.whatsapp.com/NabilaPsikologiBinus',
                'tag_name' => 'Psychology & Mental Health',
                'joined_members' => [$ayu, $siti],
                'pending_requests' => [$rian],
            ],
        ];

        foreach ($groupsData as $g) {
            $studyGroup = StudyGroup::create([
                'owner_id' => $g['owner']->id,
                'title' => $g['title'],
                'description' => $g['description'],
                'location' => $g['location'],
                'meeting_time' => $g['meeting_time'],
                'expires_at' => $g['expires_at'],
                'max_members' => $g['max_members'],
                'visibility' => $g['visibility'],
                'whatsapp_link' => $g['whatsapp_link'],
                'status' => StudyGroupStatus::OPEN->value,
            ]);

            // Attach Tag
            $tag = Tag::where('name', $g['tag_name'])->first();
            if ($tag) {
                $studyGroup->tags()->attach($tag->id);
            }

            // Owner as Member
            StudyGroupMember::create([
                'study_group_id' => $studyGroup->id,
                'user_id' => $g['owner']->id,
                'role' => MemberRole::OWNER,
                'joined_at' => now(),
            ]);

            // Joined Members
            foreach ($g['joined_members'] as $member) {
                if ($member && $member->id !== $g['owner']->id) {
                    StudyGroupMember::create([
                        'study_group_id' => $studyGroup->id,
                        'user_id' => $member->id,
                        'role' => MemberRole::MEMBER,
                        'joined_at' => now(),
                    ]);

                    JoinRequest::create([
                        'study_group_id' => $studyGroup->id,
                        'user_id' => $member->id,
                        'status' => JoinRequestStatus::APPROVED,
                    ]);
                }
            }

            // Pending Join Requests
            foreach ($g['pending_requests'] as $reqUser) {
                if ($reqUser && $reqUser->id !== $g['owner']->id) {
                    JoinRequest::create([
                        'study_group_id' => $studyGroup->id,
                        'user_id' => $reqUser->id,
                        'status' => JoinRequestStatus::PENDING,
                    ]);
                }
            }
        }
    }
}
