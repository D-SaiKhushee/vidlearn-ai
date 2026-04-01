from moviepy import VideoFileClip
import os

def extract_audio(video_path: str, audio_path: str):
    try:
        if not os.path.exists(video_path):
            raise Exception("Video file not found")
        video = VideoFileClip(video_path)
        video.audio.write_audiofile(audio_path, logger=None)
        video.close()
    except Exception as e:
        raise Exception(f"Failed to extract audio: {str(e)}")
