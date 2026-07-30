<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\University;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonString = '[
          {"name": "Universitas Internasional Semen Indonesia", "short_name": "UISI", "domain": "uisi.ac.id", "city": "Gresik"},
          {"name": "Universitas Indonesia", "short_name": "UI", "domain": "ui.ac.id", "city": "Depok"},
          {"name": "Institut Teknologi Bandung", "short_name": "ITB", "domain": "itb.ac.id", "city": "Bandung"},
          {"name": "Universitas Gadjah Mada", "short_name": "UGM", "domain": "ugm.ac.id", "city": "Yogyakarta"},
          {"name": "Institut Teknologi Sepuluh Nopember", "short_name": "ITS", "domain": "its.ac.id", "city": "Surabaya"},
          {"name": "Universitas Airlangga", "short_name": "UNAIR", "domain": "unair.ac.id", "city": "Surabaya"},
          {"name": "Universitas Brawijaya", "short_name": "UB", "domain": "ub.ac.id", "city": "Malang"},
          {"name": "Universitas Diponegoro", "short_name": "UNDIP", "domain": "undip.ac.id", "city": "Semarang"},
          {"name": "Universitas Padjadjaran", "short_name": "UNPAD", "domain": "unpad.ac.id", "city": "Sumedang"},
          {"name": "IPB University", "short_name": "IPB", "domain": "ipb.ac.id", "city": "Bogor"},
          {"name": "Universitas Sebelas Maret", "short_name": "UNS", "domain": "uns.ac.id", "city": "Surakarta"},
          {"name": "Telkom University", "short_name": "TELKOM", "domain": "telkomuniversity.ac.id", "city": "Bandung"},
          {"name": "Binus University", "short_name": "BINUS", "domain": "binus.ac.id", "city": "Jakarta"},
          {"name": "Universitas Hasanuddin", "short_name": "UNHAS", "domain": "unhas.ac.id", "city": "Makassar"},
          {"name": "Universitas Udayana", "short_name": "UNUD", "domain": "unud.ac.id", "city": "Denpasar"},
          {"name": "Universitas Negeri Surabaya", "short_name": "UNESA", "domain": "unesa.ac.id", "city": "Surabaya"},
          {"name": "Universitas Negeri Yogyakarta", "short_name": "UNY", "domain": "uny.ac.id", "city": "Yogyakarta"},
          {"name": "Universitas Muhammadiyah Yogyakarta", "short_name": "UMY", "domain": "umy.ac.id", "city": "Yogyakarta"},
          {"name": "Universitas Islam Indonesia", "short_name": "UII", "domain": "uii.ac.id", "city": "Yogyakarta"},
          {"name": "UPN \"Veteran\" Jawa Timur", "short_name": "UPNJATIM", "domain": "upnjatim.ac.id", "city": "Surabaya"},
          {"name": "Universitas Negeri Jakarta", "short_name": "UNJ", "domain": "unj.ac.id", "city": "Jakarta"},
          {"name": "Universitas Negeri Malang", "short_name": "UM", "domain": "um.ac.id", "city": "Malang"},
          {"name": "Universitas Negeri Semarang", "short_name": "UNNES", "domain": "unnes.ac.id", "city": "Semarang"},
          {"name": "Universitas Negeri Padang", "short_name": "UNP", "domain": "unp.ac.id", "city": "Padang"},
          {"name": "Universitas Pendidikan Indonesia", "short_name": "UPI", "domain": "upi.edu", "city": "Bandung"},
          {"name": "Universitas Andalas", "short_name": "UNAND", "domain": "unand.ac.id", "city": "Padang"},
          {"name": "Universitas Sriwijaya", "short_name": "UNSRI", "domain": "unsri.ac.id", "city": "Palembang"},
          {"name": "Universitas Sumatera Utara", "short_name": "USU", "domain": "usu.ac.id", "city": "Medan"},
          {"name": "Universitas Jenderal Soedirman", "short_name": "UNSOED", "domain": "unsoed.ac.id", "city": "Purwokerto"},
          {"name": "Universitas Syiah Kuala", "short_name": "USK", "domain": "unsyiah.ac.id", "city": "Banda Aceh"},
          {"name": "Universitas Lampung", "short_name": "UNILA", "domain": "unila.ac.id", "city": "Bandar Lampung"},
          {"name": "Universitas Jember", "short_name": "UNEJ", "domain": "unej.ac.id", "city": "Jember"},
          {"name": "Universitas Mulawarman", "short_name": "UNMUL", "domain": "unmul.ac.id", "city": "Samarinda"},
          {"name": "Universitas Sam Ratulangi", "short_name": "UNSRAT", "domain": "unsrat.ac.id", "city": "Manado"},
          {"name": "Universitas Mataram", "short_name": "UNRAM", "domain": "unram.ac.id", "city": "Mataram"},
          {"name": "Universitas Riau", "short_name": "UNRI", "domain": "unri.ac.id", "city": "Pekanbaru"},
          {"name": "Universitas Lambung Mangkurat", "short_name": "ULM", "domain": "unlam.ac.id", "city": "Banjarmasin"},
          {"name": "Universitas Nusa Cendana", "short_name": "UNDANA", "domain": "undana.ac.id", "city": "Kupang"},
          {"name": "Universitas Pattimura", "short_name": "UNPATTI", "domain": "unpatti.ac.id", "city": "Ambon"},
          {"name": "Universitas Cenderawasih", "short_name": "UNCEN", "domain": "uncen.ac.id", "city": "Jayapura"},
          {"name": "Universitas Pelita Harapan", "short_name": "UPH", "domain": "uph.edu", "city": "Tangerang"},
          {"name": "Universitas Katolik Parahyangan", "short_name": "UNPAR", "domain": "unpar.ac.id", "city": "Bandung"},
          {"name": "Universitas Trisakti", "short_name": "TRISAKTI", "domain": "trisakti.ac.id", "city": "Jakarta"},
          {"name": "Universitas Tarumanagara", "short_name": "UNTAR", "domain": "untar.ac.id", "city": "Jakarta"},
          {"name": "Universitas Surabaya", "short_name": "UBAYA", "domain": "ubaya.ac.id", "city": "Surabaya"},
          {"name": "Universitas Kristen Petra", "short_name": "PETRA", "domain": "petra.ac.id", "city": "Surabaya"},
          {"name": "Universitas Muhammadiyah Malang", "short_name": "UMM", "domain": "umm.ac.id", "city": "Malang"},
          {"name": "Universitas Muhammadiyah Surakarta", "short_name": "UMS", "domain": "ums.ac.id", "city": "Surakarta"},
          {"name": "Universitas Islam Negeri Syarif Hidayatullah", "short_name": "UINJKT", "domain": "uinjkt.ac.id", "city": "Jakarta"},
          {"name": "Sekolah Tinggi Akuntansi Negara", "short_name": "STAN", "domain": "stan.ac.id", "city": "Tangerang Selatan"},
          {"name": "Universitas Muhammadiyah Gresik", "short_name": "UMG", "domain": "umg.ac.id", "city": "Gresik"}
        ]';

        $items = json_decode($jsonString, true);

        foreach ($items as $item) {
            University::updateOrCreate(
                ['domain' => $item['domain']],
                [
                    'name' => $item['name'],
                    'short_name' => $item['short_name'],
                    'domain' => $item['domain'],
                    'city' => $item['city'],
                ]
            );
        }
    }
}
