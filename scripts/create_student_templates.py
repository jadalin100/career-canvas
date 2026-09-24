from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "site" / "templates"
OUTPUT.mkdir(parents=True, exist_ok=True)

NAVY = "1C2E4A"
DUSTY = "52677D"
IVORY = "BDC4D4"
CREAM = "D1CFC9"
LINE = "D9D9D9"


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def borders(table):
    tbl_pr = table._tbl.tblPr
    borders_el = tbl_pr.find(qn("w:tblBorders"))
    if borders_el is None:
        borders_el = OxmlElement("w:tblBorders")
        tbl_pr.append(borders_el)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = qn(f"w:{edge}")
        element = borders_el.find(tag)
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders_el.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "6")
        element.set(qn("w:color"), LINE)


def set_cell_margins(cell, top=120, start=140, bottom=120, end=140):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def add_field_table(doc, rows):
    for label, prompt in rows:
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.space_after = Pt(5)
        label_run = paragraph.add_run(f"{label}: ")
        label_run.bold = True
        label_run.font.size = Pt(10)
        label_run.font.color.rgb = RGBColor(15, 26, 43)
        prompt_run = paragraph.add_run(f"[{prompt}]")
        prompt_run.font.size = Pt(10.5)
        prompt_run.font.color.rgb = RGBColor(82, 103, 125)
    doc.add_paragraph()


def add_writing_space(doc, lines=4):
    paragraph = doc.add_paragraph("[Type your response here]")
    paragraph.paragraph_format.space_after = Pt(28)
    paragraph.runs[0].font.color.rgb = RGBColor(82, 103, 125)
    paragraph.runs[0].font.size = Pt(10.5)


def base_document(title, subtitle):
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.7)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    styles = doc.styles
    styles["Normal"].font.name = "Aptos"
    styles["Normal"].font.size = Pt(11)
    styles["Normal"].font.color.rgb = RGBColor(15, 26, 43)
    styles["Normal"].paragraph_format.space_after = Pt(7)
    for name, size in (("Title", 20), ("Heading 1", 17), ("Heading 2", 13)):
        styles[name].font.name = "Aptos Display"
        styles[name].font.size = Pt(size)
        styles[name].font.bold = True
        styles[name].font.color.rgb = RGBColor(0, 0, 0)
        styles[name].paragraph_format.space_before = Pt(10)
        styles[name].paragraph_format.space_after = Pt(7)
    title_ppr = styles["Title"]._element.get_or_add_pPr()
    title_border = title_ppr.find(qn("w:pBdr"))
    if title_border is not None:
        title_ppr.remove(title_border)

    p = doc.add_paragraph("CAREER CANVAS")
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.space_after = Pt(18)
    run = p.runs[0]
    run.bold = True
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(82, 103, 125)

    doc.add_paragraph(title, style="Title")
    intro = doc.add_paragraph(subtitle)
    intro.paragraph_format.space_after = Pt(14)
    intro.runs[0].font.color.rgb = RGBColor(82, 103, 125)
    intro.runs[0].font.size = Pt(10.5)
    add_field_table(doc, [("Student", "Type your name"), ("Business", "Type the partner business"), ("Date", "Type the date")])

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.add_run("Career Canvas  |  Great Neck South")
    footer.runs[0].font.size = Pt(9)
    footer.runs[0].font.color.rgb = RGBColor(82, 103, 125)
    return doc


def section(doc, heading, guidance, fields=None, lines=4):
    doc.add_heading(heading, level=1)
    p = doc.add_paragraph(guidance)
    p.runs[0].italic = True
    p.runs[0].font.color.rgb = RGBColor(82, 103, 125)
    if fields:
        add_field_table(doc, fields)
    else:
        add_writing_space(doc, lines)


def save_paper_spotlight():
    doc = base_document(
        "Local Business Spotlight Paper",
        "Use this template to explain one local business, the audience it serves, and one evidence-based recommendation.",
    )
    section(doc, "Business overview", "Introduce the business in your own words.", [
        ("What it offers", "Main product or service"),
        ("Audience", "Who the business serves"),
        ("Community role", "Why it matters locally"),
    ])
    section(doc, "What we learned", "Summarize the strongest facts from the business introduction, interview, and research.", lines=5)
    section(doc, "Audience insight", "Explain one need, preference, or behavior you noticed in the target audience.", lines=4)
    section(doc, "Recommendation", "Propose one realistic idea. Connect it directly to your evidence.", lines=5)
    section(doc, "Sources", "List each source with its title, organization, date, and link. Do not paste text from the source.", lines=4)
    doc.save(OUTPUT / "paper-local-business-spotlight.docx")


def save_paper_comparison():
    doc = base_document(
        "Competitor Comparison Paper",
        "Use this template to compare a partner business with two relevant competitors and identify a focused opportunity.",
    )
    section(doc, "Comparison question", "Write the exact question your comparison will answer.", lines=3)
    doc.add_heading("Evidence table", level=1)
    add_field_table(doc, [
        ("Business", "Partner business and two competitors"),
        ("Audience", "Who each one targets"),
        ("Message", "What each brand emphasizes"),
        ("Digital presence", "Website, social media, reviews, or other evidence"),
        ("Creative strength", "One thing each does especially well"),
    ])
    section(doc, "Pattern you found", "Explain the most important similarity or difference.", lines=4)
    section(doc, "Opportunity", "Recommend one way the partner could stand out. Support it with evidence.", lines=5)
    section(doc, "Sources", "List each source with its title, organization, date, and link.", lines=4)
    doc.save(OUTPUT / "paper-competitor-comparison.docx")


def save_paper_campaign():
    doc = base_document(
        "Creative Campaign Brief",
        "Use this template to turn business research into a clear plan for an advertisement or digital campaign.",
    )
    section(doc, "Campaign goal", "State one specific result the campaign should support.", [
        ("Audience", "Who should notice or act"),
        ("Desired action", "What you want the audience to do"),
        ("Key message", "The single idea they should remember"),
    ])
    section(doc, "Research evidence", "Add three findings that shaped the campaign. Explain where each came from.", lines=6)
    doc.add_page_break()
    doc.add_paragraph()
    section(doc, "Creative direction", "Describe the tone, visual choices, and channel. Explain why they fit the audience.", lines=5)
    section(doc, "Success measure", "Name one practical way the business could tell whether the idea worked.", lines=3)
    section(doc, "Sources", "List each source with its title, organization, date, and link.", lines=4)
    doc.save(OUTPUT / "paper-creative-campaign-brief.docx")


def save_portfolio_story():
    doc = base_document(
        "Project Story Portfolio",
        "Use this portfolio to show how your work changed from the first idea to the finished project.",
    )
    for heading, prompt in [
        ("The challenge", "What did the business or audience need?"),
        ("My research", "What evidence changed your thinking?"),
        ("First version", "Insert or link your first draft and explain your choices."),
        ("Feedback and revision", "What feedback did you receive, and what did you change?"),
        ("Final work", "Insert or link the paper, ad, and quiz. Describe how they connect."),
        ("Reflection", "What creative or business skill improved most? What would you try next?"),
    ]:
        section(doc, heading, prompt, lines=4)
    doc.save(OUTPUT / "portfolio-project-story.docx")


def save_portfolio_showcase():
    doc = base_document(
        "Visual Showcase Portfolio",
        "Use this portfolio when the ad, quiz screens, and visual decisions are the strongest part of your project.",
    )
    section(doc, "One sentence concept", "Describe the whole project in one sentence.", lines=2)
    section(doc, "Audience and visual direction", "Name the audience, mood, colors, type, and image style. Explain why they fit.", lines=4)
    section(doc, "Featured work 1", "Insert a screenshot or link. Add a short caption explaining the goal, your choice, and what you learned.", lines=5)
    doc.add_page_break()
    doc.add_paragraph()
    for n in range(2, 4):
        section(doc, f"Featured work {n}", "Insert a screenshot or link. Add a short caption explaining the goal, your choice, and what you learned.", lines=5)
    section(doc, "Consistency check", "Explain how the paper, ad, and quiz feel like parts of one brand experience.", lines=4)
    section(doc, "Reflection", "What is the strongest creative decision in this portfolio, and why?", lines=3)
    doc.save(OUTPUT / "portfolio-visual-showcase.docx")


def save_portfolio_case_study():
    doc = base_document(
        "Business Case Study Portfolio",
        "Use this portfolio to emphasize your reasoning, evidence, and recommendation for the partner business.",
    )
    section(doc, "Business context", "What does the business do, who does it serve, and what question did you investigate?", lines=4)
    section(doc, "Evidence", "Summarize the interview, research, and observations that mattered most.", lines=5)
    section(doc, "Insight", "What did the evidence reveal about the audience or business?", lines=4)
    doc.add_page_break()
    doc.add_paragraph()
    section(doc, "Solution and reflection", "Show how your final work responds to the evidence, then explain what changed.", [
        ("Solution", "How the ad and quiz respond to the insight"),
        ("Feedback", "What a student, teacher, or partner said and what you revised"),
        ("Result", "What you completed"),
        ("Next step", "What you would improve with more time"),
    ])
    doc.save(OUTPUT / "portfolio-business-case-study.docx")


if __name__ == "__main__":
    save_paper_spotlight()
    save_paper_comparison()
    save_paper_campaign()
    save_portfolio_story()
    save_portfolio_showcase()
    save_portfolio_case_study()
    print("Created 6 Career Canvas templates")
