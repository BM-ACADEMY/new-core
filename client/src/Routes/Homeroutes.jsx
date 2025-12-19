import About from '@/Components/Homepage/About'
import CompanyStatusSection from '@/Components/Homepage/CompanyStatusSection'
import Homepage from '@/Components/Homepage/Homepage'
import MissionVision from '@/Components/Homepage/Mission&vissison'
import ServicesSection from '@/Components/Homepage/Servcies'
import Section from '@/Components/Homepage/Trustbrand'
import WhyChooseUs from '@/Components/Homepage/Whycompany'
// import Profilesection from '@/Components/Homepage/Profilesection'
import TestimonialSlider from '@/Components/Homepage/Testimonials'
import React from 'react'
import Gallerysection from '@/Components/Homepage/Gallery'
import Newspapercard from '@/Components/Homepage/Newspapercard'

const Homeroutes = () => {
  return (
    <div>
      <Homepage/>
      <Section/>
      <About/>
      <ServicesSection/>
      <MissionVision/>
      <CompanyStatusSection/>
      <WhyChooseUs/>
      {/* <Profilesection/> */}
      <TestimonialSlider/>
      <Gallerysection/>
      <Newspapercard/>
    </div>
  )
}

export default Homeroutes
