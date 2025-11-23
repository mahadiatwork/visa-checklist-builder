const visaChecklists = {
  partner: {
    visaType: "820",
    visaName: "Partner Visa",
    categories: [
      {
        key: "primary_applicant_documents",
        title: "Primary Applicant Documents",
        items: [
          {
            key: "primary_birth_certificate",
            label: "Birth Certificate",
            required: true
          },
          {
            key: "primary_passport",
            label: "Passport",
            required: true
          },
          {
            key: "primary_prev_marriage_certificate",
            label: "Previous Marriage Certificate (if applicable)",
            required: false,
            conditionalOn: {
              field: "primaryApplicant.previousMarriage",
              equals: true
            }
          },
          {
            key: "primary_divorce_certificate",
            label: "Divorce Certificate (if applicable)",
            required: false,
            conditionalOn: {
              field: "primaryApplicant.divorced",
              equals: true
            }
          },
          {
            key: "primary_death_certificate_former_partner",
            label: "Death Certificate – Former Partner (if applicable)",
            required: false,
            conditionalOn: {
              field: "primaryApplicant.formerPartnerDeceased",
              equals: true
            }
          },
          {
            key: "primary_afp_clearance",
            label: "AFP Clearance Certificate – Primary Applicant",
            required: true
          },
          {
            key: "primary_overseas_police_clearance",
            label: "Police Clearance Certificate (Overseas) – Primary Applicant",
            required: true
          }
        ]
      },
      {
        key: "relationship_evidence",
        title: "Relationship Evidence",
        items: [
          {
            key: "joint_bank_statements",
            label: "Joint Bank Account Statements",
            required: true,
            group: "financial"
          },
          {
            key: "joint_property_title",
            label: "Joint Property Title",
            required: false,
            group: "financial"
          },
          {
            key: "joint_lease_rental",
            label: "Joint Lease / Rental Agreement",
            required: false,
            group: "financial"
          },
          {
            key: "bills_utilities_superannuation",
            label: "Bills, Utilities & Superannuation Documents",
            required: false,
            group: "financial"
          },
          {
            key: "joint_financial_commitments",
            label: "Joint Financial Commitments (loans, mortgages, insurance, etc.)",
            required: false,
            group: "financial"
          },
          {
            key: "relationship_statements",
            label: "Relationship Statements (Primary Applicant & Sponsor)",
            required: true,
            group: "commitment"
          },
          {
            key: "form_888",
            label: "Form 888 – Statutory Declarations",
            required: true,
            group: "social"
          },
          {
            key: "friends_family_statements",
            label: "Statements from Friends & Family",
            required: true,
            group: "social"
          },
          {
            key: "joint_travel",
            label: "Evidence of Joint Travel",
            required: true,
            group: "travel"
          },
          {
            key: "joint_invitations",
            label: "Joint Invitations / Events",
            required: false,
            group: "social"
          },
          {
            key: "living_same_address",
            label: "Evidence of Living at Same Address",
            required: true,
            group: "household"
          },
          {
            key: "messages_screenshots",
            label: "Screenshots of Text Messages / Communication History",
            required: false,
            group: "social"
          },
          {
            key: "photos_social_media",
            label: "Photos Together & Social Evidence",
            required: false,
            group: "social"
          },
          {
            key: "wills_super_beneficiary",
            label: "Wills / Superannuation Beneficiary Evidence",
            required: false,
            group: "commitment"
          },
          {
            key: "marriage_certificate",
            label: "Marriage Certificate (if married)",
            required: false,
            group: "marriage",
            conditionalOn: {
              field: "relationship.isMarried",
              equals: true
            }
          }
        ]
      },
      {
        key: "sponsor_documents",
        title: "Sponsor Documents",
        items: [
          {
            key: "sponsor_citizenship_pr",
            label: "Australian Citizenship Certificate or PR Visa / PR Notice",
            required: true
          },
          {
            key: "sponsor_birth_certificate",
            label: "Birth Certificate",
            required: true
          },
          {
            key: "sponsor_passport",
            label: "Passport",
            required: true
          },
          {
            key: "sponsor_afp_clearance",
            label: "AFP Clearance Certificate – Sponsor",
            required: true
          },
          {
            key: "sponsor_divorce_certificate",
            label: "Divorce Certificate – Sponsor (if applicable)",
            required: false,
            conditionalOn: {
              field: "sponsor.divorced",
              equals: true
            }
          },
          {
            key: "sponsor_death_certificate_former_partner",
            label: "Death Certificate – Sponsor's Former Partner (if applicable)",
            required: false,
            conditionalOn: {
              field: "sponsor.formerPartnerDeceased",
              equals: true
            }
          }
        ]
      },
      {
        key: "starting_activities",
        title: "Starting Activities",
        items: [
          {
            key: "partner_visa_questionnaire",
            label: "Client Visa Questionnaire – Partner Visa Questionnaire",
            required: false
          }
        ]
      }
    ],
    meta: {
      version: "1.0.0",
      source: "Partner visa.pdf (pages 1–2)",
      createdAt: "2025-11-23"
    }
  },
  temporaryWork: {
    visaType: "482",
    visaName: "Temporary Work Visa",
    categories: [
      {
        key: "starting_activities",
        title: "Starting Activities",
        items: [
          {
            key: "client_web_questionnaire_482",
            label: "Client Web Questionnaire - Skills in Demand (482)",
            required: true
          }
        ]
      },
      {
        key: "primary_applicant_documents",
        title: "Primary Applicant Documents",
        items: [
          {
            key: "primary_passport",
            label: "Primary Applicant - Passport",
            required: true
          },
          {
            key: "primary_passport_photos",
            label: "Primary Applicant - Passport Photos",
            required: true
          }
        ]
      },
      {
        key: "skills_documents",
        title: "Skills Documents",
        items: [
          {
            key: "skills_cv",
            label: "Skills - Curriculum Vitae",
            required: true
          },
          {
            key: "skills_employment_contract",
            label: "Skills - Employment Contract",
            required: true
          },
          {
            key: "skills_english_test_results",
            label: "Skills - English Language Test Results Certificate",
            required: true
          },
          {
            key: "skills_licence_or_registration",
            label: "Skills - Licence or Registration",
            required: false
          },
          {
            key: "skills_qualification_certificate",
            label: "Skills - Qualification Certificate",
            required: true
          },
          {
            key: "skills_reference_letters",
            label: "Skills - Reference Letters",
            required: true
          },
          {
            key: "skills_training_certificates",
            label: "Skills - Training Certificates",
            required: false
          }
        ]
      },
      {
        key: "character_documents",
        title: "Character Documents",
        items: [
          {
            key: "primary_afp_clearance",
            label: "AFP Clearance Certificate - Primary Applicant",
            required: true
          },
          {
            key: "primary_overseas_police_clearance",
            label: "Police Clearance Certificate (Overseas) - Primary Applicant",
            required: true
          }
        ]
      }
    ],
    meta: {
      version: "1.0.0",
      source: "482 checklist screenshot",
      createdAt: "2025-11-23"
    }
  },
  protection: {
    visaType: "866",
    visaName: "Protection Visa",
    categories: [
      {
        key: "starting_activities",
        title: "Starting Activities",
        items: [
          {
            key: "client_web_questionnaire_form80",
            label: "Client Web Questionnaire - Form 80 Questionnaire",
            required: true
          },
          {
            key: "vevo_search",
            label: "VEVO Search",
            required: false
          }
        ]
      },
      {
        key: "primary_applicant_documents",
        title: "Primary Applicant Documents",
        items: [
          {
            key: "primary_passport_current_all_pages",
            label: "Primary Applicant - Passport (Current) - All pages",
            required: true
          },
          {
            key: "primary_passport_expired_all_pages",
            label: "Primary Applicant - Passport (Expired) - All pages",
            required: false
          },
          {
            key: "primary_national_id_original_english",
            label: "Primary Applicant - National ID Card (Original and English Translation)",
            required: true
          },
          {
            key: "primary_protection_claims_other_evidence",
            label: "Protection Claims - Other Evidence",
            required: true
          },
          {
            key: "primary_australian_visa_grant_notice",
            label: "Primary Applicant - Australian Visa Grant Notice",
            required: false
          }
        ]
      }
    ],
    meta: {
      version: "1.0.0",
      source: "866 checklist screenshot",
      createdAt: "2025-11-23"
    }
  },
  employerSponsored: {
    visaType: "186",
    visaName: "Permanent Employer Sponsor Visa (ENS)",
    categories: [
      {
        key: "starting_activities",
        title: "Starting Activities",
        items: [
          {
            key: "client_web_questionnaire_ens_rsms",
            label: "Client Web Questionnaire - ENS/RSMS Visa Questionnaire",
            required: true
          }
        ]
      },
      {
        key: "skills_documents",
        title: "Skills Documents",
        items: [
          {
            key: "skills_cv",
            label: "Skills - Curriculum Vitae",
            required: true
          },
          {
            key: "skills_employment_contract",
            label: "Skills - Employment Contract",
            required: true
          },
          {
            key: "skills_english_test_results",
            label: "Skills - English Language Test Results Certificate",
            required: true
          },
          {
            key: "skills_pay_slips",
            label: "Skills - Pay Slips (Evidence of Employment)",
            required: true
          },
          {
            key: "skills_ato_notices",
            label: "Skills - ATO Notices of Assessment",
            required: true
          },
          {
            key: "skills_income_statements",
            label: "Skills - Income Statements",
            required: true
          }
        ]
      },
      {
        key: "primary_applicant_documents",
        title: "Primary Applicant Documents",
        items: [
          {
            key: "primary_passport",
            label: "Primary Applicant - Passport (All pages)",
            required: true,
            note: "Passport should be included (per checklist note)."
          }
        ]
      },
      {
        key: "secondary_applicant_documents",
        title: "Secondary Applicant / Spouse Documents",
        items: [
          {
            key: "secondary_passport",
            label: "Secondary Applicant - Passport (All pages)",
            required: false,
            note: "Passport should be included (per checklist note)."
          }
        ]
      },
      {
        key: "character_documents",
        title: "Character Documents",
        items: [
          {
            key: "primary_afp_clearance",
            label: "AFP Clearance Certificate - Primary Applicant",
            required: true
          },
          {
            key: "secondary_afp_clearance",
            label: "AFP Clearance Certificate - Secondary Applicant (Spouse)",
            required: false
          },
          {
            key: "primary_overseas_police_clearance",
            label: "Police Clearance Certificate (Overseas) - Primary Applicant",
            required: true
          },
          {
            key: "secondary_overseas_police_clearance",
            label: "Police Clearance Certificate (Overseas) - Secondary Applicant (Spouse)",
            required: false
          }
        ]
      },
      {
        key: "other_uploads",
        title: "Other",
        items: [
          {
            key: "other_portal_uploads",
            label: "Other Documents uploaded to Portal by Client",
            required: false
          }
        ]
      }
    ],
    meta: {
      version: "1.0.0",
      source: "186 checklist screenshot",
      createdAt: "2025-11-23"
    }
  }
};

export default visaChecklists;
