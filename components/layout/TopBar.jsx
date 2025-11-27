"use client";
import { useState } from "react";
import { PhoneIcon } from "../Icons";
import { EmailIcon, InstagramIcon, YoutubeIcon, FacebookIcon, TwitterIcon } from "../Icons/SocialMediaIcons";



export default function TopBar() {
  const [systemData, setSystemData] = useState({
    phoneNumber: "(225) 555-0118",
    email: "michelle.rivera@example.com",
    informationDeal: "Follow Us get a chance to win 80% off",
    socialMedia: [
      {name: "instagram", url: "https://www.instagram.com/example", Icon: InstagramIcon},
      {name: "youtube", url: "https://www.youtube.com/example", Icon: YoutubeIcon},
      {name: "facebook", url: "https://www.facebook.com/example", Icon: FacebookIcon},
      {name: "twitter", url: "https://www.twitter.com/example", Icon: TwitterIcon},
    ]
  })
  return (
    <div className="w-full flex justify-center bg-[#23856D] overflow-hidden" style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}>
      <div className="w-full max-w-7xl px-4 py-4 animate-marquee whitespace-nowrap" style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}>
        <div className="inline-flex gap-12">
            <div className="flex items-center gap-2 ">
              <PhoneIcon className="w-4 h-4"/>
              <span className="text-white text-sm">{systemData.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <EmailIcon className="w-4 h-4"/>
              <span className="text-white text-sm">{systemData.email}</span>
            </div>
            <div className="flex items-center gap-2" >
              <p className="text-white text-sm font-semibold">{systemData.informationDeal}</p>
            </div>
            <div className="flex items-center gap-3" >
              <p className="text-white text-sm">Follow Us :</p>
              {systemData.socialMedia.map((social, index) => {
                const IconComponent = social.Icon;
                return (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );

}