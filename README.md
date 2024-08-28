# MIKSEr


[https://mikser.onrender.com/playlists](https://mikser.onrender.com/playlists/)

## <br> **Application Features**

MIKSEr is a music guessing game application. Songs are warped in a variety of ways and it's your job to correctly figure out what song it is. 

<br>
Songs are warped by either being sped up, slowed down, or cut into a very short snippet. The more incorrect guesses you make, the more normal the song will sound until you run out of guesses or get it right.
<br>
<br>
Song data is collected from the spotify API. The application intentionally uses the Client Credentials flow as opposed to OAuth, which uses server-to-server authentication rather than a user authorization.
The application does not require any endpoints that access Spotify User information, so Oauth set up is unecessary. This makes the application slightly more user friendly by removing the sign in step.
<br>
<br>
Playable tracks are embedded in the application useing the spotify iFrame APi. these appear when songs are guessed.

### **Playlists**
Users can create an account and make publically available playlists of warped songs that others can try and guess.
Playlists are stored in a MonogoDB database. Songs are saved as an ID, representing the track ID used by the Spofity APi.
<br> 

### <br> **Random Tracks**

The application is capable of generating playlists contaning three random songs. This is done using a random song selector algorithm. This makes use of the song popularity score to ensure songs that are relatively well known are selected.

## **Technologies Used**


<ul>
    <li>Express.JS</li>
    <li>MongoDB</li>
    <li>Spotify API</li>
</ul>

