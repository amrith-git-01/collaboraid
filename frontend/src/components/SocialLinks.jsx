import { Linkedin, Github, Instagram } from 'lucide-react';

function SocialLinks() {
  const links = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/amrith-bharath-v-s-278542258/',
      icon: Linkedin,
    },
    {
      name: 'Github',
      url: 'https://github.com/amrith-git-01',
      icon: Github,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/amrith_bharath_v_s/',
      icon: Instagram,
    },
  ];
  return (
    <div className="flex items-center space-x-4">
      {links.map(social => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon group relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
        >
          <social.icon className="w-5 h-5 text-gray-600 hover:text-purple-600" />
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {social.name}
          </span>
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
