Prep Mantraa Claude
FOLDER
Logo Prep Mantraa
Logo Prep Mantraa
FOLDER
Making videos pipeline for Prep Mantraa a new youtube channel:
Youtube:  https://www.youtube.com/@PrepMantraa
Instagram: https://www.instagram.com/prepmantraa/

analyse these profiles and start building a profile create a standard visual, graphical, content wise theme and quality for this channels

For reference: 
https://www.youtube.com/shorts/37FswrMStwE
https://www.youtube.com/shorts/pz5EbhxKNOg
https://www.youtube.com/shorts/xcCDFvhY_J8
https://www.youtube.com/shorts/A7oPVjvcAzo
https://www.youtube.com/shorts/Ej0iFy8QeEM
https://www.youtube.com/shorts/Ej0iFy8QeEM
https://www.youtube.com/shorts/K3iJxmkD5ic

Use these reference video visuals and create a own theme for this new channel. use "Prep mantraa claude" folder for setting this video editing pipeline.
Use visual presentations and delivery techniques to create own videos 9:16 shorts or long 16:9 based on demand.
I'lll uploading audio recording of the script accordingly , generate videos MCQs explanation/ topic explanation/ Tips and tricks visuals/ for current affairs, History, civics, Geography, Economics, Physics, Chemistry, math or any subjects with suitable animations/ graphics/ black screen writing.
Create a profile that can be used everytime i give script/ recorded scripts/ topic name/ topic details/ content in text/ pdf/ image/ raw video / raw audio.
Clean the audio and modify the content/ pause/ noise/ back ground noise/ fumble/ fillers etc and make clean professional smooth uniform audio level of vocals/ generated suitable background  music / sfx/ theme

Add Prep Mantraa banding in the videos logo files is shared "Logo Prep Mantraa" folder.

Thought for 38s

Checking the Lothal script against the original lecture.

जांच रहे हैं कि मूल व्याख्यान में नाम और कहानी का वर्णन कैसे था।

मूल व्याख्यान की कहानी वाले हिस्से को ठीक से सुनने के लिए ट्रांसक्रिप

जांच करके ऑडियो की आवाज़ साफ़ करने के तरीके चुने जा रहे हैं।

स्टिकमैन चरित्रों की गतिविधियाँ और उनके प्रॉप्स तय की जा रही हैं।

Five things to do: control of your laptop, an accurate Lothal script, cleaner audio, stick-figure animations, and a separate v2 set of the 7 shorts. I’ll start by taking control of the laptop, since that lets me run Whisper and the audio tools myself.

Command-line windows are click-only for me (no typing), so I’ll write the scripts into your folder and run them by double-clicking in File Explorer. Requesting access to File Explorer.

Looking up apps
Requesting app access
Diagnosing recording issues, then starting slow Whisper transcription
Opening File Explorer
Clicking
Clicking
Clicking
Clicking
Building fixes for thumps, hum, echo, boom, and noise
Tightening plosive detection and easing the boom cut
Tracking down the corrupt cached block file.
Loaded tools
Making the block save atomic so this can't recur, then resuming:
Clean timeline matches exactly (446.89 s). Quick before/after measurement on the old vs new voice track:
Comparing the new voice track against the large-v3 transcript on Windows
Now writing the stick-figure module:
The file is too big for one shell call. I'll write it in my workspace and copy it to your folder:
Writing the file and sorting out the odd glyph.
Created
stickman.py
Cleaning up the fallen-body rotation and ground offset.
Edited
stickman.py
Edited
stickman.py
Adding sound cues for stick actions in Canvas.
Adding sound cues for the figure's actions (thud on fall, pop on slap, etc.), then a test sheet of poses and props:
Enlarging the head and simplifying the face
The copy on your drive doesn't match (the known stale-upload issue). Checking:
Device has the earlier version. Applying the face changes directly on the device:
Faces now read clearly. Checking the transcript:
Large-v3 is now transcribing on your GPU. Meanwhile, reviewing the shorts builder to make the v2 version:
Checking whether transcription progress output appears yet.
No progress for 5 minutes. Checking whether the Windows job is alive:
Checking why the first chunk is still running.
Loaded tools
Clicking
Pressing “Action summary: Refreshes the...”
Failed
Clicking
Stopping the large model and switching to turbo with beam search
Clicking
Simplifying the decode-scene prop logic before copying it over:
Stale copy again; applying the edit directly on the device:
Verifying the file checksum and starting the transcription.
Reviewing Hanuman's crown detail.
Verifying the stick-figure story against the transcript
Starting rendering for the unaffected sites.
Checking the script's argument setup before running it.
Clicking
Renders started. Waiting for Lothal's transcription:
Windows renders fast: Harappa is already done. Lothal transcript is ready:
एस.आर. राव के अहम से गुज़रने के प्रसंग का अर्थ समझा जा रहा है।

एस.आर. राव के अहम का अर्थ और उसका संदर्भ स्पष्ट किया जा रहा है।

Verifying transcript lines against word-level timings next
Applying corrected script timings and re-timing decode rows
Fixing the intro wrap and crown clutter before rendering
Checking which render jobs survived the spec rebuild.
Clicking
Meanwhile, verifying the six finished exports (loudness, length, files) in the new folder:
Checking the video files in the v2 folder.
Queuing a second run and extending the target list.
Correct script as orginal for video: PrepMantraa_IVC-Site04-Lothal-Trick.mp4.
Make audio of all the 7 shorts video clean and free of humming /echo effects with each words. it appears like mic is very close to mouth and thumping and humming sound reduce the clarity of voice.
Add small 2-D animation/ stick man animation with the tricks /story/ content in the lower part of the video/ wherever the empty space visible on screen. and update your skill file with feature for next videos.
takeover my control on this laptop to perform all the double click and permission you need to create a video
create separate folder for new set of 7 short videos keep untouched the old ones
Checking the time before rendering again.
Checking the time before rendering again.
Picking up where I left off. Checking the current state first:

Read a file, ran a command on your computer, and 7 more steps
I’ve made a new set of all 7 shorts. They’re in export\2026-11-08_IVC-Shorts-v2\, one sub-folder per site with the video, thumbnail, YouTube/Instagram text and notes. The old videos in the 2026-11-07_… folders were not touched. All 7 are 1080×1920 at −13 LUFS, and I watched sample frames of the finished Lothal and Dholavira videos to confirm the figures appear.

Lothal script: I re-transcribed the recording more carefully and the on-screen story now matches what was spoken:
"इंडिया के एस.आर. राव / अहम से गुज़र रहे थे / इसकी वजह से वो लोथ हो गए / और लोथ होके भोगने लगे".
I added the intro line "बहुत घमंडी (अहम)!" where you describe him that way.
The decode rows now appear exactly when you say each one.
Only Lothal’s wording changed. I didn’t re-check the other six scripts word by word, so it’s worth reading their on-screen lines once.
Audio: all 7 now use a newly cleaned voice track, measured on the Lothal section before and after:
The thumping from the mic being close to your mouth is down by about 16 dB.
The humming is now below the background noise.
The boomy sound is reduced, and voice clarity is up about 5 dB.
Each word dies away faster, so there’s less echo.
The cuts and timing are the same as before. I haven’t listened to the result myself, so do give one video a listen.
Stick-figure animation: a small chalk stick figure in the empty lower part of the screen acts out each story as you speak it:
Lothal: a proud walk, then he faints with stars and cries.
Kalibangan: Hanuman puts on bangles and a ghaghra, the king shouts "भूत!!" and slaps him.
Others: a nawab dancing with ghungroo, a man sitting on a wheel with a crown, a tailor stitching a torn ghaghra, and a man in a lungi playing the dhol.
On the decode screens, a student thinks, points and then celebrates.
I added this to the pipeline’s instruction files, so future trick videos get stick figures and the new audio cleaning by default.
Laptop control: I ran the scripts on your laptop by double-clicking them in File Explorer. Rendering on the laptop was much faster than in my own workspace. One limit: your laptop’s graphics card is too small for Whisper’s most accurate transcription model, so I used the “turbo” model with more careful settings instead.
Separate folder: each new video is named like PrepMantraa_IVC-Site04-Lothal-Trick.mp4, inside its own IVC-Site0X-…-Trick folder under the new parent folder.
