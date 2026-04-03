import yt_dlp
import imageio_ffmpeg
import os
import subprocess

def download_youtube_audio(url: str, output_path: str):
    try:
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        output_path = os.path.normpath(output_path)
        stem = output_path.replace('.mp3', '')
        audio_dir = os.path.dirname(output_path)

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': stem + '.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'cookiefile': os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'cookies.txt'),
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        all_files = os.listdir(audio_dir)
        stem_basename = os.path.basename(stem)
        candidates = [
            os.path.join(audio_dir, f)
            for f in all_files
            if f.startswith(stem_basename) and not f.endswith('.mp3')
        ]

        if not candidates:
            raise Exception(f"yt-dlp did not produce any audio file.")
        actual_raw = candidates[0]

        convert_cmd = [
            ffmpeg_exe, '-y', '-i', actual_raw,
            '-ar', '16000', '-ac', '1', '-b:a', '128k', output_path
        ]
        result = subprocess.run(convert_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"ffmpeg conversion failed: {result.stderr}")

        if os.path.exists(actual_raw):
            os.remove(actual_raw)

    except Exception as e:
        raise Exception(f"Failed to extract YouTube audio: {str(e)}")
